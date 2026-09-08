import { CompanyFinancials } from '../types/company';
import { StockDailyCandle, StockPrice, StockSummary } from '../types/stock';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8001';

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const body: ApiEnvelope<T> = await response.json();

  if (!body.success || body.data === null) {
    throw new Error(body.error?.message ?? '알 수 없는 오류가 발생했습니다.');
  }
  return body.data;
}

export function searchStocks(query: string): Promise<StockSummary[]> {
  return request<StockSummary[]>(`/api/stocks/search?q=${encodeURIComponent(query)}`);
}

export function getStockPrice(code: string): Promise<StockPrice> {
  return request<StockPrice>(`/api/stocks/${encodeURIComponent(code)}/price`);
}

export function getStockDaily(code: string, days = 30): Promise<StockDailyCandle[]> {
  return request<StockDailyCandle[]>(`/api/stocks/${encodeURIComponent(code)}/daily?days=${days}`);
}

export function getCompanyFinancials(code: string): Promise<CompanyFinancials> {
  return request<CompanyFinancials>(`/api/companies/${encodeURIComponent(code)}/financials`);
}
