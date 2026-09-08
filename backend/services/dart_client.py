"""OpenDART 단일회사 전체 재무제표(fnlttSinglAcntAll) 클라이언트.
DART_API_KEY가 없으면(발급 전 개발 단계) 전역 USE_MOCK_API와 무관하게 mock 데이터를
반환한다 — KIS는 이미 실연동 중이므로 DART만 독립적으로 mock 유지가 가능해야 한다."""

import datetime
from typing import Any

import httpx

from config import settings
from core.response import ApiError
from models.company import CompanyFinancials
from services import dart_corp_code, mock_company_data

_DART_BASE_URL = "https://opendart.fss.or.kr"
_REPORT_CODE = "11011"  # 사업보고서(연간)만 사용 — 반기/분기와 섞으면 지표 비교가 왜곡됨
_REPORT_LABEL = {"CFS": "연결재무제표", "OFS": "개별재무제표"}

# 필드별 매칭 스펙. account_id(있으면) 우선, 없으면 sj_div로 제한한 account_nm 정확 일치.
# account_nm은 부분일치("in") 금지 — "부채총계"가 "자본과부채총계"에 포함되는 식의
# 오매칭을 막기 위함.
_ACCOUNT_SPECS: dict[str, dict[str, Any]] = {
    "revenue": {
        "sj_div": ("IS", "CIS"),
        "account_id": ["ifrs-full_Revenue", "ifrs-full_RevenueFromContractsWithCustomers"],
        "account_nm": ["매출액", "영업수익"],  # 은행/지주사(KB금융 등)는 "영업수익"
    },
    "operatingIncome": {
        "sj_div": ("IS", "CIS"),
        "account_id": ["dart_OperatingIncomeLoss"],
        "account_nm": ["영업이익"],
    },
    "netIncome": {
        "sj_div": ("IS", "CIS"),
        "account_id": ["ifrs-full_ProfitLoss"],
        "account_nm": ["당기순이익"],  # "당기순이익(지배기업소유주지분)" 등은 제외
    },
    "totalAssets": {
        "sj_div": ("BS",),
        "account_id": ["ifrs-full_Assets"],
        "account_nm": ["자산총계"],
    },
    "totalLiabilities": {
        "sj_div": ("BS",),
        "account_id": ["ifrs-full_Liabilities"],
        "account_nm": ["부채총계"],
    },
    "totalEquity": {
        "sj_div": ("BS",),
        "account_id": ["ifrs-full_Equity"],
        "account_nm": ["자본총계"],
    },
    "eps": {
        "sj_div": ("IS", "CIS"),
        "account_id": ["ifrs-full_BasicEarningsLossPerShare"],
        "account_nm": ["기본주당이익", "기본주당순이익"],  # "희석주당이익"과 구분
    },
}


def _use_mock() -> bool:
    return settings.use_mock_api or not settings.dart_api_key


def _parse_amount(raw: str | None) -> float | None:
    if not raw:
        return None
    cleaned = raw.replace(",", "").strip()
    if not cleaned:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def _extract_field(rows: list[dict], spec: dict[str, Any]) -> float | None:
    candidate_rows = [row for row in rows if row.get("sj_div") in spec["sj_div"]]

    for row in candidate_rows:
        if row.get("account_id") in spec["account_id"]:
            value = _parse_amount(row.get("thstrm_amount"))
            if value is not None:
                return value

    for alias in spec["account_nm"]:
        for row in candidate_rows:
            if (row.get("account_nm") or "").strip() == alias:
                value = _parse_amount(row.get("thstrm_amount"))
                if value is not None:
                    return value

    return None


async def _fetch_statement(
    client: httpx.AsyncClient, corp_code: str, year: int, fs_div: str
) -> list[dict] | None:
    response = await client.get(
        "/api/fnlttSinglAcntAll.json",
        params={
            "crtfc_key": settings.dart_api_key,
            "corp_code": corp_code,
            "bsns_year": str(year),
            "reprt_code": _REPORT_CODE,
            "fs_div": fs_div,
        },
    )

    if response.status_code != 200:
        raise ApiError("DART_REQUEST_FAILED", "DART 재무제표 조회에 실패했습니다.", status_code=502)

    body = response.json()
    status = body.get("status")

    if status == "013":
        return None
    if status != "000":
        raise ApiError("DART_REQUEST_FAILED", "DART 재무제표 조회에 실패했습니다.", status_code=502)

    return body.get("list") or []


def _build_financials(code: str, name: str, rows: list[dict], year: int, fs_div: str) -> CompanyFinancials:
    net_income = _extract_field(rows, _ACCOUNT_SPECS["netIncome"])
    total_equity = _extract_field(rows, _ACCOUNT_SPECS["totalEquity"])
    roe = None
    if net_income is not None and total_equity:
        roe = round(net_income / total_equity * 100, 2)

    return CompanyFinancials(
        code=code,
        name=name,
        fiscalYear=year,
        reportType=fs_div,
        reportLabel=f"{year}년 사업보고서 ({_REPORT_LABEL[fs_div]})",
        revenue=_extract_field(rows, _ACCOUNT_SPECS["revenue"]),
        operatingIncome=_extract_field(rows, _ACCOUNT_SPECS["operatingIncome"]),
        netIncome=net_income,
        totalAssets=_extract_field(rows, _ACCOUNT_SPECS["totalAssets"]),
        totalLiabilities=_extract_field(rows, _ACCOUNT_SPECS["totalLiabilities"]),
        totalEquity=total_equity,
        eps=_extract_field(rows, _ACCOUNT_SPECS["eps"]),
        roe=roe,
    )


async def get_financials(stock_code: str, name: str) -> CompanyFinancials:
    if _use_mock():
        mock = mock_company_data.get_mock_financials(stock_code)
        if mock is not None:
            return mock
        return CompanyFinancials(code=stock_code, name=name)

    corp_code = await dart_corp_code.get_corp_code(stock_code)
    if corp_code is None:
        return CompanyFinancials(code=stock_code, name=name)

    current_year = datetime.date.today().year

    async with httpx.AsyncClient(base_url=_DART_BASE_URL, timeout=15.0) as client:
        for year in (current_year - 1, current_year - 2):
            for fs_div in ("CFS", "OFS"):
                rows = await _fetch_statement(client, corp_code, year, fs_div)
                if rows:
                    return _build_financials(stock_code, name, rows, year, fs_div)

    return CompanyFinancials(code=stock_code, name=name)
