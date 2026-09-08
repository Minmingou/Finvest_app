"""DART_API_KEY 미설정 시 dart_client가 반환하는 더미 재무데이터.
mock_stock_data.py와 동일한 4종목만 지원한다 — 나머지 종목은 기존과 같이 미지원 상태."""

from models.company import CompanyFinancials

_MOCK_FINANCIALS: dict[str, CompanyFinancials] = {
    "005930": CompanyFinancials(
        code="005930", name="삼성전자", fiscalYear=2025, reportType="CFS",
        reportLabel="2025년 사업보고서 (연결재무제표, Mock)",
        revenue=300870903000000, operatingIncome=32725961000000, netIncome=34451351000000,
        totalAssets=455905980000000, totalLiabilities=112339878000000, totalEquity=343566102000000,
        eps=4691, roe=10.03,
    ),
    "000660": CompanyFinancials(
        code="000660", name="SK하이닉스", fiscalYear=2025, reportType="CFS",
        reportLabel="2025년 사업보고서 (연결재무제표, Mock)",
        revenue=66192000000000, operatingIncome=23467000000000, netIncome=19834000000000,
        totalAssets=103627000000000, totalLiabilities=39812000000000, totalEquity=63815000000000,
        eps=27234, roe=31.08,
    ),
    "035420": CompanyFinancials(
        code="035420", name="NAVER", fiscalYear=2025, reportType="CFS",
        reportLabel="2025년 사업보고서 (연결재무제표, Mock)",
        revenue=9670000000000, operatingIncome=1517000000000, netIncome=1085000000000,
        totalAssets=23345000000000, totalLiabilities=7612000000000, totalEquity=15733000000000,
        eps=6624, roe=6.90,
    ),
    "005380": CompanyFinancials(
        code="005380", name="현대차", fiscalYear=2025, reportType="CFS",
        reportLabel="2025년 사업보고서 (연결재무제표, Mock)",
        revenue=162663000000000, operatingIncome=14239000000000, netIncome=12290000000000,
        totalAssets=283000000000000, totalLiabilities=176000000000000, totalEquity=107000000000000,
        eps=55671, roe=11.49,
    ),
}


def get_mock_financials(code: str) -> CompanyFinancials | None:
    return _MOCK_FINANCIALS.get(code)
