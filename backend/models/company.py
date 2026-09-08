from pydantic import BaseModel


class CompanyFinancials(BaseModel):
    code: str
    name: str
    fiscalYear: int | None = None
    reportType: str | None = None  # "CFS" | "OFS"
    reportLabel: str | None = None

    revenue: float | None = None
    operatingIncome: float | None = None
    netIncome: float | None = None
    totalAssets: float | None = None
    totalLiabilities: float | None = None
    totalEquity: float | None = None

    eps: float | None = None
    roe: float | None = None
    per: float | None = None
    pbr: float | None = None
