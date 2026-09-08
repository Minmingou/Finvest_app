from pydantic import BaseModel


class StockSummary(BaseModel):
    code: str
    name: str
    market: str


class StockPrice(BaseModel):
    code: str
    name: str
    currentPrice: float
    changeAmount: float
    changeRate: float
    volume: int
    openPrice: float
    highPrice: float
    lowPrice: float
    prevClosePrice: float


class StockDailyCandle(BaseModel):
    date: str
    openPrice: float
    highPrice: float
    lowPrice: float
    closePrice: float
    volume: int
