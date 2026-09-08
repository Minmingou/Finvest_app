"""OpenDART corpCode.xml 조회 — 종목코드(6자리)↔corp_code(8자리) 매핑.
DART REST API에는 종목코드로 직접 조회하는 엔드포인트가 없어, 전체 기업 목록을
담은 ZIP(XML)을 내려받아 파싱한 뒤 캐싱해 사용한다. 파일이 수 MB 단위라 앱 시작 시
가져오지 않고 최초 요청 시 지연 로딩하며, 동시 요청이 중복 다운로드하지 않도록
asyncio.Lock으로 보호한다."""

import asyncio
import io
import time
import xml.etree.ElementTree as ET
import zipfile

import httpx

from config import settings
from core.response import ApiError

_DART_BASE_URL = "https://opendart.fss.or.kr"

_cached_map: dict[str, str] | None = None
_cached_expires_at: float = 0.0
_TTL_SECONDS = 24 * 60 * 60

_fetch_lock = asyncio.Lock()


async def _fetch_corp_code_map() -> dict[str, str]:
    async with httpx.AsyncClient(base_url=_DART_BASE_URL, timeout=30.0) as client:
        response = await client.get("/api/corpCode.xml", params={"crtfc_key": settings.dart_api_key})

    if response.status_code != 200:
        raise ApiError("DART_REQUEST_FAILED", "DART 기업 코드 조회에 실패했습니다.", status_code=502)

    with zipfile.ZipFile(io.BytesIO(response.content)) as zf:
        inner_name = zf.namelist()[0]
        xml_bytes = zf.read(inner_name)

    root = ET.fromstring(xml_bytes)

    mapping: dict[str, str] = {}
    for item in root.iter("list"):
        stock_code = (item.findtext("stock_code") or "").strip()
        corp_code = (item.findtext("corp_code") or "").strip()
        if stock_code and corp_code:
            mapping[stock_code] = corp_code
    return mapping


async def get_corp_code(stock_code: str) -> str | None:
    global _cached_map, _cached_expires_at

    if _cached_map is not None and time.monotonic() < _cached_expires_at:
        return _cached_map.get(stock_code)

    async with _fetch_lock:
        if _cached_map is not None and time.monotonic() < _cached_expires_at:
            return _cached_map.get(stock_code)

        mapping = await _fetch_corp_code_map()
        _cached_map = mapping
        _cached_expires_at = time.monotonic() + _TTL_SECONDS

    return _cached_map.get(stock_code)
