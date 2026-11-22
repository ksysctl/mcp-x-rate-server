/** Base URL for the Ministerio de Hacienda DGT API. */
export const DGT_BASE_URL =
  process.env.DGT_BASE_URL?.trim() || "https://api.hacienda.go.cr";

/** Time-to-live for cached DGT exchange-rate responses. */
export const DGT_CACHE_TTL_MS = 15 * 60 * 1000;
