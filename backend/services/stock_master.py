"""KOSPI/KOSDAQ 전체 종목마스터 파일(.mst) 다운로드 및 파싱.
KIS Open API에는 이름으로 종목을 검색하는 REST 엔드포인트가 없어, KIS가 배포하는
종목마스터 파일(코스피/코스닥 .mst)을 직접 받아 파싱한다. 파일 포맷과 필드 오프셋은
github.com/koreainvestment/open-trading-api 공식 예제(stocks_info/kis_*_code_mst.py)를
따른다. 파일이 커서(수백 KB) 앱 시작 시 받지 않고 최초 검색 요청 시 지연 로딩하며,
동시 요청이 중복 다운로드하지 않도록 asyncio.Lock으로 보호하고 TTL로 캐싱한다."""

import asyncio
import io
import time
import zipfile

import httpx

from models.stock import StockSummary

_MASTER_TTL_SECONDS = 24 * 60 * 60

# (시장 구분, 다운로드 URL, part1/part2 분리 기준 길이)
# part2(시장별 상세 필드 블록)의 길이가 코스피는 228, 코스닥은 222로 서로 다르다.
_MARKETS: list[tuple[str, str, int]] = [
    ("KOSPI", "https://new.real.download.dws.co.kr/common/master/kospi_code.mst.zip", 228),
    ("KOSDAQ", "https://new.real.download.dws.co.kr/common/master/kosdaq_code.mst.zip", 222),
]

# 마스터파일 다운로드가 실패할 때(네트워크 차단 등) 검색 기능이 완전히 죽지 않도록
# 최소한의 주요 종목만 담은 폴백 목록.
_FALLBACK_STOCK_MASTER: list[StockSummary] = [
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

_cached_master: list[StockSummary] | None = None
_cached_expires_at: float = 0.0
_fetch_lock = asyncio.Lock()


def _parse_mst(raw_bytes: bytes, trim_len: int, market: str) -> list[StockSummary]:
    text = raw_bytes.decode("cp949", errors="replace")
    stocks: list[StockSummary] = []
    for line in text.splitlines():
        if len(line) <= trim_len:
            continue
        part1 = line[: len(line) - trim_len]
        code = part1[0:9].strip()
        name = part1[21:].strip()
        # KIS 시세 조회 API가 실제로 처리하는 6자리 숫자 종목코드만 검색 대상으로 삼는다.
        # (F7로 시작하는 사모펀드 등록코드 등은 이 종목코드 체계 밖이라 시세 조회 대상이 아님)
        if len(code) == 6 and code.isdigit() and name:
            stocks.append(StockSummary(code=code, name=name, market=market))
    return stocks


async def _download_market(client: httpx.AsyncClient, market: str, url: str, trim_len: int) -> list[StockSummary]:
    response = await client.get(url)
    response.raise_for_status()
    with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
        raw_bytes = zf.read(zf.namelist()[0])
    return _parse_mst(raw_bytes, trim_len, market)


async def _fetch_stock_master() -> list[StockSummary]:
    async with httpx.AsyncClient(timeout=30.0) as client:
        results = await asyncio.gather(
            *(_download_market(client, market, url, trim_len) for market, url, trim_len in _MARKETS)
        )
    combined = [stock for group in results for stock in group]
    return combined


async def _get_stock_master() -> list[StockSummary]:
    global _cached_master, _cached_expires_at

    if _cached_master is not None and time.monotonic() < _cached_expires_at:
        return _cached_master

    async with _fetch_lock:
        if _cached_master is not None and time.monotonic() < _cached_expires_at:
            return _cached_master

        try:
            master = await _fetch_stock_master()
            if not master:
                raise ValueError("empty master list")
        except (httpx.HTTPError, zipfile.BadZipFile, ValueError):
            master = _cached_master or _FALLBACK_STOCK_MASTER

        _cached_master = master
        _cached_expires_at = time.monotonic() + _MASTER_TTL_SECONDS

    return _cached_master


async def search_stocks(query: str) -> list[StockSummary]:
    normalized = query.strip().lower()
    if not normalized:
        return []
    master = await _get_stock_master()
    return [stock for stock in master if normalized in stock.name.lower() or normalized in stock.code]


async def find_stock(code: str) -> StockSummary | None:
    master = await _get_stock_master()
    return next((s for s in master if s.code == code), None)
