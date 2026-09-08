import time
from typing import Any


class TTLCache:
    """단순 인메모리 TTL 캐시. 프로세스 재시작 시 초기화되며 다중 워커 환경에서는
    공유되지 않는다 — 워커를 늘려야 할 때 Redis 등으로 교체할 지점."""

    def __init__(self):
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() >= expires_at:
            del self._store[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl_seconds: float) -> None:
        self._store[key] = (time.monotonic() + ttl_seconds, value)


price_cache = TTLCache()
daily_cache = TTLCache()
financials_cache = TTLCache()

PRICE_TTL_SECONDS = 10
DAILY_TTL_SECONDS = 600
FINANCIALS_TTL_SECONDS = 86400
