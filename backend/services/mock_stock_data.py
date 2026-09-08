"""USE_MOCK_API=true일 때 kis_client가 반환하는 더미 데이터.
실제 KIS 응답과 동일한 정규화 스키마(models/stock.py)를 따른다."""

from datetime import date, timedelta

from models.stock import StockDailyCandle, StockPrice

_MOCK_PRICES: dict[str, StockPrice] = {
    "005930": StockPrice(
        code="005930", name="삼성전자", currentPrice=72300, changeAmount=1500,
        changeRate=2.12, volume=15234567, openPrice=71200, highPrice=72500,
        lowPrice=71000, prevClosePrice=70800,
    ),
    "000660": StockPrice(
        code="000660", name="SK하이닉스", currentPrice=189500, changeAmount=-2500,
        changeRate=-1.30, volume=4523100, openPrice=192000, highPrice=192500,
        lowPrice=188500, prevClosePrice=192000,
    ),
    "035420": StockPrice(
        code="035420", name="NAVER", currentPrice=215000, changeAmount=3000,
        changeRate=1.42, volume=987654, openPrice=212500, highPrice=216000,
        lowPrice=212000, prevClosePrice=212000,
    ),
    "005380": StockPrice(
        code="005380", name="현대차", currentPrice=254000, changeAmount=0,
        changeRate=0.0, volume=654321, openPrice=254000, highPrice=256500,
        lowPrice=252500, prevClosePrice=254000,
    ),
}


def get_mock_price(code: str) -> StockPrice | None:
    return _MOCK_PRICES.get(code)


def get_mock_daily(code: str, days: int = 30) -> list[StockDailyCandle]:
    base = _MOCK_PRICES.get(code)
    if base is None:
        return []
    candles: list[StockDailyCandle] = []
    price = base.currentPrice
    today = date.today()
    for i in range(days):
        d = today - timedelta(days=i)
        # 결정론적인 소폭 변동만 부여 — 실제 데이터가 아님을 명시하는 목적의 더미
        drift = (i % 5 - 2) * (price * 0.004)
        close = round(price - drift, 0)
        candles.append(
            StockDailyCandle(
                date=d.isoformat(),
                openPrice=close,
                highPrice=round(close * 1.01, 0),
                lowPrice=round(close * 0.99, 0),
                closePrice=close,
                volume=base.volume,
            )
        )
    return candles
