from fastapi import APIRouter, Query

from core.response import ok
from services import kis_client
from services.stock_master import search_stocks

router = APIRouter()


@router.get("/search")
async def search(q: str = Query(..., min_length=1)) -> dict:
    results = await search_stocks(q)
    return ok([s.model_dump() for s in results])


@router.get("/{code}/price")
async def price(code: str) -> dict:
    result = await kis_client.get_price(code)
    return ok(result.model_dump())


@router.get("/{code}/daily")
async def daily(code: str, days: int = Query(default=30, ge=1, le=100)) -> dict:
    result = await kis_client.get_daily(code, days)
    return ok([c.model_dump() for c in result])
