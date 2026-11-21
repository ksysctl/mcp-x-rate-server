import { getUsdToCrcRate } from "../dgtClient.js";

export interface RateToolResult {
  [key: string]: unknown;
  content: [{ type: "text"; text: string }];
  isError?: boolean;
}

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
