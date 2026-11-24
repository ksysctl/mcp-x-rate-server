#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { handleGetUsdToCrcRate } from "./helpers/getUsdToCrcRate.js";

const server = new McpServer({
  name: "dgt-x-rate-mcp",
  version: "1.0.0",
});

server.registerTool(
  "get_usd_crc_rate",
  {
    description:
      "Get the official Costa Rica USD to CRC (Colones) bid (compra) and selling (venta) exchange rate from DGT for today or a specific date.",
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
    inputSchema: {
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
        .optional()
        .describe("Optional specific date in YYYY-MM-DD format (e.g. 2026-11-21). Omit for the current date."),
    },
  },
  async ({ date }) => handleGetUsdToCrcRate(date)
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("dgt-x-rate-mcp server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
