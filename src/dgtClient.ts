export interface ExchangeRateResult {
  date: string;
  currency: "USD";
  targetCurrency: "CRC";
  bid: number;     // Compra
  selling: number; // Venta
}

interface DgtRateItem {
  fecha?: string;
  valor?: number;
}

interface DgtCurrentResponse {
  compra?: DgtRateItem;
  venta?: DgtRateItem;
}

interface DgtHistoricEntry {
  fecha?: string;
  compra?: number | DgtRateItem;
  venta?: number | DgtRateItem;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDgtRateItem(value: unknown): value is DgtRateItem {
  return (
    isRecord(value) &&
    (value.fecha === undefined || typeof value.fecha === "string") &&
    (value.valor === undefined || typeof value.valor === "number")
  );
}

function isDgtRateValue(value: unknown): value is number | DgtRateItem {
  return typeof value === "number" || isDgtRateItem(value);
}

function isDgtHistoricEntry(value: unknown): value is DgtHistoricEntry {
  return (
    isRecord(value) &&
    (value.fecha === undefined || typeof value.fecha === "string") &&
    (value.compra === undefined || isDgtRateValue(value.compra)) &&
    (value.venta === undefined || isDgtRateValue(value.venta))
  );
}

const BASE_URL = "https://hacienda.go.cr";
const cache = new Map<string, { expiresAt: number; data: ExchangeRateResult }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export function clearDgtCache(): void {
  cache.clear();
}

function getCostaRicaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
  }).format(new Date());
}

function extractNumericRate(field: number | DgtRateItem | undefined): number {
  if (typeof field === "number" && Number.isFinite(field)) return field;
  if (field && typeof field === "object") {
    const value: unknown = field.valor;
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }
  throw new Error("Unexpected response structure from DGT API");
}

function parseCurrentResponse(payload: unknown): DgtCurrentResponse {
  if (!isRecord(payload)) {
    throw new Error("Unexpected response structure from DGT API");
  }

  const parsed: DgtCurrentResponse = {};
  if (payload.compra !== undefined) {
    if (!isDgtRateItem(payload.compra)) {
      throw new Error("Unexpected response structure from DGT API");
    }
    parsed.compra = payload.compra;
  }
  if (payload.venta !== undefined) {
    if (!isDgtRateItem(payload.venta)) {
      throw new Error("Unexpected response structure from DGT API");
    }
    parsed.venta = payload.venta;
  }
  return parsed;
}

export async function getUsdToCrcRate(date?: string): Promise<ExchangeRateResult> {
  const cacheKey = date ?? "current";
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = date
    ? `${BASE_URL}/historico?d=${encodeURIComponent(date)}&h=${encodeURIComponent(date)}`
    : BASE_URL;

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
    const data = parseCurrentResponse(payload);
    result = {
      date: data.venta?.fecha ?? data.compra?.fecha ?? getCostaRicaToday(),
      currency: "USD",
      targetCurrency: "CRC",
      bid: extractNumericRate(data.compra),
      selling: extractNumericRate(data.venta),
    };
  } else {
    const entries: unknown[] = Array.isArray(payload) ? payload : [];
    const entry = entries.find(
      (candidate): candidate is DgtHistoricEntry =>
        isDgtHistoricEntry(candidate) && candidate.fecha === date
    ) ?? entries.find(
      (candidate): candidate is DgtHistoricEntry =>
        isDgtHistoricEntry(candidate) && candidate.fecha === undefined
    );
    if (!entry) {
      throw new Error(`No exchange rate data found for date ${date}`);
    }
    result = {
      date: entry.fecha ?? date,
      currency: "USD",
      targetCurrency: "CRC",
      bid: extractNumericRate(entry.compra),
      selling: extractNumericRate(entry.venta),
    };
  }

  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, data: result });
  return result;
}
