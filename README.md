# dgt-x-rate-mcp

A Model Context Protocol (MCP) server built with TypeScript that fetches official USD to CRC (Costa Rican Colón) bid (*compra*) and selling (*venta*) exchange rates from Costa Rica's DGT / Ministerio de Hacienda public API (`https://hacienda.go.cr`).

## Features

- **Current & Historical Rates**: Retrieves today's USD/CRC exchange rate or looks up any historical date (`YYYY-MM-DD`).
- **Built-in Caching**: Uses a 15-minute in-memory TTL cache to prevent redundant API calls and stay well within Hacienda's rate limits (20 req/s burst, 10 req/s sustained).
- **Timezone-Aware**: Defaults to Costa Rica local time (`America/Costa_Rica`) when resolving current dates.
- **Strict TypeScript**: Built with ES modules, Zod schema validation, ESLint (`strictTypeChecked`), and Node's native test runner.

## Available Tools

### `get_usd_crc_rate`

Fetches the official USD to CRC bid and selling exchange rates.

**Parameters:**
- `date` *(optional, string)*: Specific date in `YYYY-MM-DD` format (e.g., `2026-11-21`). Omit to fetch the current exchange rate.

**Example Response:**
```json
{
  "date": "2026-11-21",
  "currency": "USD",
  "targetCurrency": "CRC",
  "bid": 505.12,
  "selling": 511.45
}
```

## Upstream API Reference

This server wraps the exchange rate endpoints documented in the [Ministerio de Hacienda API Documentation](https://api.hacienda.go.cr/docs):
- **Current USD Rate**: `GET https://hacienda.go.cr`
- **Historical USD Rate**: `GET https://hacienda.go.cr/historico?d=YYYY-MM-DD&h=YYYY-MM-DD`

## Setup & Installation

**Prerequisites:** Node.js `>= 22`

```bash
npm install
npm run build
```

## Client Configuration

### VS Code (GitHub Copilot)

Add the server to `.vscode/mcp.json`:

```json
{
  "servers": {
    "dgt-x-rate-mcp": {
      "command": "node",
      "args": ["${workspaceFolder}/build/src/index.js"]
    }
  }
}
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dgt-x-rate-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/dgt-x-rate-mcp/build/src/index.js"]
    }
  }
}
```

## Development Scripts

| Command | Description |
| :--- | :--- |
| `npm run build` | Compiles TypeScript (`src/` and `tests/`) into `build/` |
| `npm run lint` | Runs strict ESLint checks across `src/` and `tests/` |
| `npm test` | Builds the project and runs unit tests via `node:test` |
| `npm run check` | Runs linting, compilation, and unit tests in sequence |

## Project Structure

```text
├── src/
│   ├── dgtClient.ts   # HTTP client, response normalization, and TTL cache
│   ├── index.ts       # MCP server definition and stdio transport setup
│   └── tools/
│       └── getUsdToCrcRate.ts # MCP tool result handling
├── tests/
│   └── dgtCLient.test.ts
├── AGENTS.md          # AI coding agent instructions and conventions
└── package.json
```
