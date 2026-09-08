"""KIS Open API에는 이름으로 종목을 검색하는 REST 엔드포인트가 없다 — 실제로는
KIS가 배포하는 종목마스터 파일(코스피/코스닥 .mst) 다운로드 방식을 쓴다.
전체 종목 마스터파일 연동 전까지, 자주 조회되는 주요 종목만 정적 목록으로 검색을 지원한다."""

from models.stock import StockSummary

STOCK_MASTER: list[StockSummary] = [
    StockSummary(code="005930", name="삼성전자", market="KOSPI"),
    StockSummary(code="000660", name="SK하이닉스", market="KOSPI"),
    StockSummary(code="035420", name="NAVER", market="KOSPI"),
    StockSummary(code="005380", name="현대차", market="KOSPI"),
    StockSummary(code="035720", name="카카오", market="KOSPI"),
    StockSummary(code="373220", name="LG에너지솔루션", market="KOSPI"),
    StockSummary(code="207940", name="삼성바이오로직스", market="KOSPI"),
    StockSummary(code="068270", name="셀트리온", market="KOSPI"),
    StockSummary(code="005490", name="POSCO홀딩스", market="KOSPI"),
    StockSummary(code="105560", name="KB금융", market="KOSPI"),
]


def search_stocks(query: str) -> list[StockSummary]:
    normalized = query.strip().lower()
    if not normalized:
        return []
    return [
        stock
        for stock in STOCK_MASTER
        if normalized in stock.name.lower() or normalized in stock.code
    ]


def find_stock(code: str) -> StockSummary | None:
    return next((s for s in STOCK_MASTER if s.code == code), None)
