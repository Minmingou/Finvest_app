export interface CompanyFinancials {
  code: string;
  name: string;
  fiscalYear: number | null;
  reportType: string | null;
  reportLabel: string | null;

  revenue: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;
  totalEquity: number | null;

  eps: number | null;
  roe: number | null;
  per: number | null;
  pbr: number | null;
}
