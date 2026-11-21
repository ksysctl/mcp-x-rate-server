import type {
  DgtCurrentResponse,
  DgtHistoricEntry,
  DgtRateItem,
  ExchangeRateResult,
} from "./types.js";
import { DGT_BASE_URL, DGT_CACHE_TTL_MS } from "./constants.js";

/**
 * Client for fetching and caching current or historical USD/CRC exchange rates.
 */
export class DgtClient {
  private readonly cache = new Map<string, { expiresAt: number; data: ExchangeRateResult }>();

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private isDgtRateItem(value: unknown): value is DgtRateItem {
    return (
      this.isRecord(value) &&
      (value.fecha === undefined || typeof value.fecha === "string") &&
      (value.valor === undefined || typeof value.valor === "number")
    );
  }

  private isDgtRateValue(value: unknown): value is number | DgtRateItem {
    return typeof value === "number" || this.isDgtRateItem(value);
  }

  private isDgtHistoricEntry(value: unknown): value is DgtHistoricEntry {
    return (
      this.isRecord(value) &&
      (value.fecha === undefined || typeof value.fecha === "string") &&
      (value.compra === undefined || this.isDgtRateValue(value.compra)) &&
      (value.venta === undefined || this.isDgtRateValue(value.venta))
    );
  }

  private getCostaRicaToday(): string {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Costa_Rica",
    }).format(new Date());
  }

  private extractNumericRate(field: number | DgtRateItem | undefined): number {
    if (typeof field === "number" && Number.isFinite(field)) return field;

    if (field && typeof field === "object") {
      const value: unknown = field.valor;

      if (typeof value === "number" && Number.isFinite(value)) {
        return value;
      }
    }

    throw new Error("Unexpected response structure from DGT API");
  }

  private parseCurrentResponse(payload: unknown): DgtCurrentResponse {
    if (!this.isRecord(payload)) {
      throw new Error("Unexpected response structure from DGT API");
    }

    const parsed: DgtCurrentResponse = {};

    if (payload.compra !== undefined) {
      if (!this.isDgtRateItem(payload.compra)) {
        throw new Error("Unexpected response structure from DGT API");
      }

      parsed.compra = payload.compra;
    }

    if (payload.venta !== undefined) {
      if (!this.isDgtRateItem(payload.venta)) {
        throw new Error("Unexpected response structure from DGT API");
      }

      parsed.venta = payload.venta;
    }

    return parsed;
  }

  /**
   * Clears cached current and historical exchange rates.
   *
   * Primarily used to isolate requests in tests or force fresh DGT API calls.
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Fetches the current or historical USD/CRC exchange rate.
   *
   * @param date - Optional date in `YYYY-MM-DD` format. Omit it to fetch today's rate.
   * @returns The normalized bid and selling exchange rates.
   * @throws {Error} When the DGT API request fails or returns unexpected or unavailable data.
   */
  public async getUsdToCrcRate(date?: string): Promise<ExchangeRateResult> {
    const cacheKey = date ?? "current";
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const url = date
      ? `${DGT_BASE_URL}/historico?d=${encodeURIComponent(date)}&h=${encodeURIComponent(date)}`
      : DGT_BASE_URL;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (response.status === 429) {
      throw new Error("Rate limit exceeded on DGT API (HTTP 429). Try again shortly.");
    }

    if (!response.ok) {
      throw new Error(`DGT API request failed with HTTP ${String(response.status)}`);
    }

    const payload: unknown = await response.json();
    let result: ExchangeRateResult;

    if (!date) {
      const data = this.parseCurrentResponse(payload);
      result = {
        date: data.venta?.fecha ?? data.compra?.fecha ?? this.getCostaRicaToday(),
        currency: "USD",
        targetCurrency: "CRC",
        bid: this.extractNumericRate(data.compra),
        selling: this.extractNumericRate(data.venta),
      };
    } else {
      const entries: unknown[] = Array.isArray(payload) ? payload : [];
      const entry = entries.find(
        (candidate): candidate is DgtHistoricEntry =>
          this.isDgtHistoricEntry(candidate) && candidate.fecha === date
      ) ?? entries.find(
        (candidate): candidate is DgtHistoricEntry =>
          this.isDgtHistoricEntry(candidate) && candidate.fecha === undefined
      );

      if (!entry) {
        throw new Error(`No exchange rate data found for date ${date}`);
      }

      result = {
        date: entry.fecha ?? date,
        currency: "USD",
        targetCurrency: "CRC",
        bid: this.extractNumericRate(entry.compra),
        selling: this.extractNumericRate(entry.venta),
      };
    }

    this.cache.set(cacheKey, { expiresAt: Date.now() + DGT_CACHE_TTL_MS, data: result });

    return result;
  }
}

/**
 * Shared DGT client instance used by MCP tool handlers.
 */
export const dgtClient = new DgtClient();
