import time

import httpx

from config import settings
from core.response import ApiError

_cached_token: str | None = None
_cached_expires_at: float = 0.0

# KIS는 토큰 발급을 분당 1회로 제한한다 — 24시간 유효하므로 만료 1시간 전에만 재발급한다.
_TOKEN_TTL_SECONDS = 23 * 60 * 60


async def get_access_token() -> str:
    global _cached_token, _cached_expires_at

    if _cached_token is not None and time.monotonic() < _cached_expires_at:
        return _cached_token

    if not settings.kis_app_key or not settings.kis_app_secret:
        raise ApiError("KIS_CREDENTIALS_MISSING", "KIS API 키가 설정되지 않았습니다.", status_code=500)

    async with httpx.AsyncClient(base_url=settings.kis_base_url, timeout=10.0) as client:
        response = await client.post(
            "/oauth2/tokenP",
            json={
                "grant_type": "client_credentials",
                "appkey": settings.kis_app_key,
                "appsecret": settings.kis_app_secret,
            },
        )

    if response.status_code != 200:
        raise ApiError("KIS_AUTH_FAILED", "KIS 인증 토큰 발급에 실패했습니다.", status_code=502)

    body = response.json()
    token = body.get("access_token")
    if not token:
        raise ApiError("KIS_AUTH_FAILED", "KIS 인증 토큰 발급에 실패했습니다.", status_code=502)

    _cached_token = token
    _cached_expires_at = time.monotonic() + _TOKEN_TTL_SECONDS
    return token
