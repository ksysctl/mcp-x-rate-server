/**
 * Normalized USD/CRC exchange rate returned by the DGT client.
 */
export interface ExchangeRateResult {
  date: string;
  currency: "USD";
  targetCurrency: "CRC";
  bid: number;     // Compra
  selling: number; // Venta
}

export interface DgtRateItem {
  fecha?: string;
  valor?: number;
}

export interface DgtCurrentResponse {
  compra?: DgtRateItem;
  venta?: DgtRateItem;
}

export interface DgtHistoricEntry {
  fecha?: string;
  compra?: number | DgtRateItem;
  venta?: number | DgtRateItem;
}
