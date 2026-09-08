from fastapi import APIRouter

from core.response import ApiError, ok
from services import dart_client, kis_client
from services.cache import FINANCIALS_TTL_SECONDS, financials_cache
from services.stock_master import find_stock

router = APIRouter()


@router.get("/{code}/financials")
async def financials(code: str) -> dict:
    stock = await find_stock(code)
    if stock is None:
        raise ApiError("STOCK_NOT_FOUND", "종목을 찾을 수 없습니다.", status_code=404)

    result = financials_cache.get(code)
    if result is None:
        result = await dart_client.get_financials(code, stock.name)
        financials_cache.set(code, result, FINANCIALS_TTL_SECONDS)

    per = None
    if result.eps:
        try:
            price = await kis_client.get_price(code)
            per = round(price.currentPrice / result.eps, 2)
        except ApiError:
            per = None  # 가격 조회 실패가 재무정보 응답 전체를 깨면 안 됨

    return ok(result.model_copy(update={"per": per}).model_dump())
