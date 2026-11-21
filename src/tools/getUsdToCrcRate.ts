import { getUsdToCrcRate } from "../dgtClient.js";

/**
 * MCP-compatible result shape for the USD/CRC rate tool.
 */
export interface RateToolResult {
  [key: string]: unknown;
  content: [{ type: "text"; text: string }];
  isError?: boolean;
}

/**
 * Handles an MCP request for the current or historical USD/CRC exchange rate.
 *
 * @param date - Optional date in `YYYY-MM-DD` format.
 * @returns An MCP text result, or an error result when the rate cannot be fetched.
 */
export async function handleGetUsdToCrcRate(date?: string): Promise<RateToolResult> {
  try {
    const rate = await getUsdToCrcRate(date);
    return {
      content: [{ type: "text", text: JSON.stringify(rate, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error fetching USD/CRC rate: ${message}` }],
      isError: true,
    };
  }
}
