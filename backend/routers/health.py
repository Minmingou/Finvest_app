from fastapi import APIRouter

from config import settings
from core.response import ok

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict:
    return ok({"status": "healthy", "environment": settings.environment, "mockMode": settings.use_mock_api})
