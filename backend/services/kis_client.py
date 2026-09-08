"""KIS Open API 도메인주식 시세 클라이언트.
Endpoint/TR_ID/파라미터는 apiportal.koreainvestment.com 및
github.com/koreainvestment/open-trading-api 공식 예제를 기준으로 구현했다.
필드명(stck_prpr 등)은 KIS 응답의 실제 필드 코드다 — 배포 전 apiportal 문서로 재확인할 것.
"""

from datetime import date, timedelta

import httpx

from config import settings
from core.response import ApiError
from models.stock import StockDailyCandle, StockPrice
from services import mock_stock_data
from services.cache import DAILY_TTL_SECONDS, PRICE_TTL_SECONDS, daily_cache, price_cache
from services.stock_master import find_stock
from services.token_manager import get_access_token

_MARKET_DIV_CODE = "J"  # 주식(J) — ETF/ETN 등은 별도 코드


def _common_headers(token: str, tr_id: str) -> dict:
    return {
        "authorization": f"Bearer {token}",
        "appkey": settings.kis_app_key,
        "appsecret": settings.kis_app_secret,
        "tr_id": tr_id,
        "custtype": "P",
    }


async def get_price(code: str) -> StockPrice:
    if settings.use_mock_api:
        mock = mock_stock_data.get_mock_price(code)
        if mock is None:
            raise ApiError("STOCK_NOT_FOUND", "종목을 찾을 수 없습니다.", status_code=404)
        return mock

    cached = price_cache.get(code)
    if cached is not None:
        return cached

    token = await get_access_token()
    async with httpx.AsyncClient(base_url=settings.kis_base_url, timeout=10.0) as client:
        response = await client.get(
            "/uapi/domestic-stock/v1/quotations/inquire-price",
            headers=_common_headers(token, "FHKST01010100"),
            params={"FID_COND_MRKT_DIV_CODE": _MARKET_DIV_CODE, "FID_INPUT_ISCD": code},
        )

    if response.status_code != 200:
        raise ApiError("KIS_REQUEST_FAILED", "시세 조회에 실패했습니다.", status_code=502)

    body = response.json()
    output = body.get("output")
    if not output or body.get("rt_cd") != "0":
        raise ApiError("STOCK_NOT_FOUND", "종목을 찾을 수 없습니다.", status_code=404)

    stock = find_stock(code)
    price = StockPrice(
        code=code,
        name=output.get("hts_kor_isnm") or (stock.name if stock else code),
        currentPrice=float(output["stck_prpr"]),
        changeAmount=float(output["prdy_vrss"]),
        changeRate=float(output["prdy_ctrt"]),
        volume=int(output["acml_vol"]),
        openPrice=float(output["stck_oprc"]),
        highPrice=float(output["stck_hgpr"]),
        lowPrice=float(output["stck_lwpr"]),
        prevClosePrice=float(output["stck_sdpr"]),
    )
    price_cache.set(code, price, PRICE_TTL_SECONDS)
    return price


async def get_daily(code: str, days: int = 30) -> list[StockDailyCandle]:
    if settings.use_mock_api:
        return mock_stock_data.get_mock_daily(code, days)

    cache_key = f"{code}:{days}"
    cached = daily_cache.get(cache_key)
    if cached is not None:
        return cached

    token = await get_access_token()
    date_to = date.today()
    date_from = date_to - timedelta(days=days * 2)  # 주말/휴장일 포함 여유분

    async with httpx.AsyncClient(base_url=settings.kis_base_url, timeout=10.0) as client:
        response = await client.get(
            "/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice",
            headers=_common_headers(token, "FHKST03010100"),
            params={
                "FID_COND_MRKT_DIV_CODE": _MARKET_DIV_CODE,
                "FID_INPUT_ISCD": code,
                "FID_INPUT_DATE_1": date_from.strftime("%Y%m%d"),
                "FID_INPUT_DATE_2": date_to.strftime("%Y%m%d"),
                "FID_PERIOD_DIV_CODE": "D",
                "FID_ORG_ADJ_PRC": "0",
            },
        )

    if response.status_code != 200:
        raise ApiError("KIS_REQUEST_FAILED", "일봉 조회에 실패했습니다.", status_code=502)

    body = response.json()
    if body.get("rt_cd") != "0":
        raise ApiError("STOCK_NOT_FOUND", "종목을 찾을 수 없습니다.", status_code=404)

    rows = body.get("output2") or []
    candles = [
        StockDailyCandle(
            date=f"{row['stck_bsop_date'][:4]}-{row['stck_bsop_date'][4:6]}-{row['stck_bsop_date'][6:]}",
            openPrice=float(row["stck_oprc"]),
            highPrice=float(row["stck_hgpr"]),
            lowPrice=float(row["stck_lwpr"]),
            closePrice=float(row["stck_clpr"]),
            volume=int(row["acml_vol"]),
        )
        for row in rows[:days]
    ]
    daily_cache.set(cache_key, candles, DAILY_TTL_SECONDS)
    return candles
