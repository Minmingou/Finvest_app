from typing import Any

from fastapi.responses import JSONResponse


class ApiError(Exception):
    """도메인 에러. 라우터/서비스에서 raise하면 공통 {success:false} 포맷으로 변환된다."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def ok(data: Any) -> dict:
    return {"success": True, "data": data, "error": None}


def fail(code: str, message: str) -> dict:
    return {"success": False, "data": None, "error": {"code": code, "message": message}}


def error_response(err: ApiError) -> JSONResponse:
    return JSONResponse(status_code=err.status_code, content=fail(err.code, err.message))
