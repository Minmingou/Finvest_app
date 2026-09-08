from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from core.response import ApiError, error_response, fail
from routers import companies, health, stocks

app = FastAPI(title="Stock5 Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ApiError)
def handle_api_error(_: Request, exc: ApiError):
    return error_response(exc)


@app.exception_handler(Exception)
def handle_unexpected_error(_: Request, exc: Exception):
    from fastapi.responses import JSONResponse

    return JSONResponse(status_code=500, content=fail("INTERNAL_ERROR", "서버 내부 오류가 발생했습니다."))


app.include_router(health.router)
app.include_router(stocks.router, prefix="/api/stocks", tags=["stocks"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
