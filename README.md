# dgt-x-rate-mcp

A Model Context Protocol (MCP) server built with TypeScript that fetches official USD to CRC (Costa Rican Colón) bid (*compra*) and selling (*venta*) exchange rates from Costa Rica's DGT / Ministerio de Hacienda public API (`https://api.hacienda.go.cr`).

## Features

- **Current & Historical Rates**: Retrieves today's USD/CRC exchange rate or looks up any historical date (`YYYY-MM-DD`).
- **Built-in Caching**: Each `DgtClient` instance uses a 15-minute in-memory TTL cache to prevent redundant API calls and stay well within Hacienda's rate limits (20 req/s burst, 10 req/s sustained).
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

## Agent Skill

The `skills/` directory contains the `dgt-x-rate` Agent Skill:

```text
skills/
└── dgt-x-rate/
    └── SKILL.md
```

[`skills/dgt-x-rate/SKILL.md`](skills/dgt-x-rate/SKILL.md) follows the open
`SKILL.md` standard and can be used with Claude Code, Cursor, and GitHub
Copilot. To bundle it for upload, run the `package:skill` script from the
repository root:

```bash
npm run package:skill
```

The script in `package.json` creates `dist/skill/dgt-x-rate.zip` from
`skills/dgt-x-rate/SKILL.md`. The skill source and generated zip are not
included in the published npm package.

## Upstream API Reference

This server wraps the exchange rate endpoints documented in the [Ministerio de Hacienda API Documentation](https://api.hacienda.go.cr/docs):
- **Current USD Rate**: `GET https://api.hacienda.go.cr/indicadores/tc/dolar`
- **Historical USD Rate**: `GET https://api.hacienda.go.cr/indicadores/tc/dolar/historico?d=YYYY-MM-DD&h=YYYY-MM-DD`

The client uses the current-rate endpoint when `date` is omitted. For a
specific date, it uses the historical endpoint and sets both `d` and `h` to
that same `YYYY-MM-DD` value.

## Setup & Installation

**Prerequisites:** Node.js `>= 22`

```bash
npm install
npm run build
```

## Client Configuration

### npm / npx

Run the published package directly:

```bash
npx -y dgt-x-rate-mcp
```

For an MCP client that supports a local executable command, use `npx`
instead of a workspace build:

```json
{
  "mcpServers": {
    "dgt-x-rate-mcp": {
      "command": "npx",
      "args": ["-y", "dgt-x-rate-mcp"]
    }
  }
}
```

### VS Code (GitHub Copilot)

Add the server to `.vscode/mcp.json`:

```json
{
  "servers": {
    "dgt-x-rate-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "dgt-x-rate-mcp"]
    }
  }
}
```

Then complete these setup steps:

1. Open the workspace in VS Code and trust the workspace when prompted.
2. Ensure Node.js 22 or newer is available in VS Code's terminal.
3. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run
   **MCP: List Servers**.
4. Start or restart `dgt-x-rate-mcp`, and confirm that it reports a running
   state.
5. Open Copilot Chat and switch to **Agent** mode.
6. Open the chat's tools/configuration menu and ensure
   `get_usd_crc_rate` is enabled for the chat.
7. Ask for a live or historical rate, for example:
   `Use get_usd_crc_rate to get today's official USD/CRC bid and selling rates`.

The server registration and tool availability are separate states. An enabled
or registered server is not necessarily selected in every Copilot Chat session.
If the tool is missing, run **MCP: List Servers** again and restart the
server before retrying.

To use the repository's DGT Agent Skill instead of calling the MCP tool
explicitly:

- The skill is available at `skills/dgt-x-rate/SKILL.md`.
- Add the skill to a compatible agent or explicitly instruct the agent to use
  it, if your Copilot/agent client supports manual skill selection.
- Otherwise, open the workspace and ask in Agent mode for the official DGT
  USD/CRC rate. The agent may discover and invoke the skill or MCP tool
  automatically when the request matches.

Forcing an explicit tool call with a prompt such as
`Use get_usd_crc_rate for today's rate` is the most reliable way to test or
require the MCP server. A skill is an instruction bundle: it does not become
the MCP tool itself or start the server.

### GitHub Copilot CLI

Copilot CLI does not read VS Code's `.vscode/mcp.json`. Register the server
directly in your user configuration:

```bash
copilot mcp add dgt-x-rate-mcp -- npx -y dgt-x-rate-mcp
```

Alternatively, add it to the workspace's `.mcp.json` using the `mcpServers`
format shown above. The workspace must be trusted for Copilot CLI to load that
file. In an interactive CLI session, use `/mcp list` to check the connection
and `/mcp get dgt-x-rate-mcp` to inspect the available tools.

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
| `npm test` | Builds the project and runs `build/tests/**/*.spec.js` via `node:test` |
| `npm run check` | Runs linting, compilation, and unit tests in sequence |
| `npm run package:skill` | Packages `skills/dgt-x-rate/SKILL.md` as `dist/skill/dgt-x-rate.zip` |

## API Configuration

Set `DGT_BASE_URL` to override the default `https://api.hacienda.go.cr` base URL.
This is useful for local mock servers and end-to-end tests:

```bash
DGT_BASE_URL=http://127.0.0.1:3000 node build/src/index.js
```

## Releases

The repository prevents direct pushes to `main` and ordinary PRs from merging
into it. Small changes are accumulated on a release branch:

1. Create `release/vMAJOR.MINOR.PATCH`, for example `release/v1.5.0`.
2. Merge feature/fix PRs into that release branch.
3. Merge the final `release/*` PR into `main`.
4. Release Please reads the `release/vMAJOR.MINOR.PATCH` version and creates or updates its automated release PR for that exact version.
5. Merge the Release Please PR to create the tag, GitHub Release, and npm
   publication.

Use [Conventional Commits](https://www.conventionalcommits.org/) to determine
the proposed version: `fix:` or `perf:` creates a patch release, `feat:`
creates a minor release, and a breaking change creates a major release.
The highest required bump across the release branch determines the version.
Release Please remains the authoritative check for the final package version.

Release tags use the standard `v<version>` format. Older
`dgt-x-rate-mcp-v<version>` tags remain available for compatibility.

The release configuration also updates the version in
`skills/dgt-x-rate/SKILL.md`. Keep that file's tool instructions and examples
synchronized with `get_usd_crc_rate` whenever its signature or behavior changes.

To enable publishing, publish the package once, then configure its npm
**Trusted Publisher** to use GitHub Actions with organization/user `ksysctl`,
repository `mcp-x-rate-server`, and workflow filename `release.yml`. Allow
direct publishing in the trusted publisher settings. The initial npm publish
is a one-time manual step; afterward the workflow uses OIDC, so no npm token
needs to be stored in GitHub. Also enable **Allow GitHub Actions to create and
approve pull requests** in the repository's Actions settings so Release Please
can open release PRs.

## Project Structure

```text
├── src/
│   ├── dgtClient.ts   # DgtClient class, response normalization, and per-instance TTL cache
│   ├── constants.ts   # DGT API and cache constants
│   ├── index.ts       # MCP server definition and stdio transport setup
│   ├── types.ts       # Shared exchange-rate and DGT response types
│   └── helpers/
│       └── getUsdToCrcRate.ts # MCP tool result handling
├── tests/
│   ├── dgtClient.spec.ts
│   └── mcpE2e.spec.ts
├── skills/
│   └── dgt-x-rate/
│       └── SKILL.md      # Agent Skill source; package with `npm run package:skill`
├── AGENTS.md          # AI coding agent instructions and conventions
└── package.json
```
