export interface StockSummary {
  code: string;
  name: string;
  market: string;
}

export interface StockPrice {
  code: string;
  name: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  volume: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  prevClosePrice: number;
}

export interface StockDailyCandle {
  date: string;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  volume: number;
}
