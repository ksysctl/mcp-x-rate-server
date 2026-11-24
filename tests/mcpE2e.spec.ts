import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer, type Server } from "node:http";
import { describe, it } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from "@modelcontextprotocol/sdk/client/stdio.js";

async function listen(server: Server): Promise<number> {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");

  const address = server.address();

  if (address === null || typeof address === "string") {
    throw new Error("Mock DGT server did not expose a TCP address");
  }

  return address.port;
}

async function closeServer(server: Server): Promise<void> {
  server.close();
  await once(server, "close");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTextContent(value: unknown): value is { type: "text"; text: string } {
  return (
    isRecord(value) &&
    value.type === "text" &&
    typeof value.text === "string"
  );
}

void describe("MCP server end-to-end", () => {
  void it("initializes over stdio and calls the USD/CRC rate tool", async () => {
    const apiServer = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://127.0.0.1");

      assert.equal(url.pathname, "/indicadores/tc/dolar/historico");
      assert.equal(url.searchParams.get("d"), "2026-10-15");
      assert.equal(url.searchParams.get("h"), "2026-10-15");

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify([
          {
            fecha: "2026-10-15",
            compra: 502.5,
            venta: 509,
          },
        ])
      );
    });

    const port = await listen(apiServer);
    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["build/src/index.js"],
      cwd: process.cwd(),
      env: {
        ...getDefaultEnvironment(),
        DGT_BASE_URL: `http://127.0.0.1:${String(port)}`,
      },
    });
    const client = new Client({
      name: "mcp-e2e-test",
      version: "1.0.0",
    });

    try {
      await client.connect(transport);

      const serverVersion = client.getServerVersion();

      assert.ok(serverVersion);
      assert.equal(serverVersion.name, "dgt-x-rate-mcp");
      assert.equal(serverVersion.version, "1.0.0");

      const { tools } = await client.listTools();
      const tool = tools.find((candidate) => candidate.name === "get_usd_crc_rate");

      assert.ok(tool);
      assert.deepEqual(tool.annotations, {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      });

      const result: unknown = await client.callTool({
        name: "get_usd_crc_rate",
        arguments: { date: "2026-10-15" },
      });

      assert.ok(isRecord(result));
      assert.equal(result.isError, undefined);

      if (!Array.isArray(result.content) || result.content.length === 0) {
        throw new Error("Expected the MCP tool to return content");
      }

      const content: unknown = result.content[0];

      if (!isTextContent(content)) {
        throw new Error("Expected the MCP tool to return text content");
      }

      assert.match(
        content.text,
        /"date": "2026-10-15"[\s\S]*"bid": 502\.5[\s\S]*"selling": 509/
      );
    } finally {
      await client.close();
      await closeServer(apiServer);
    }
  });
});
