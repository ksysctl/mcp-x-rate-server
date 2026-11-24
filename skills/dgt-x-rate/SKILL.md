---
name: dgt-x-rate
description: >-
  Fetches Costa Rica's official USD to CRC exchange rates, including bid
  (compra) and selling (venta), from the Ministerio de Hacienda / DGT public
  API for accounting, Hacienda electronic invoicing (v4.3/v4.4), and currency
  conversion.
# x-release-please-start-version
version: "1.6.0"
# x-release-please-end
metadata:
  requirements: "Requires the dgt-x-rate-mcp MCP server, launched with npx -y dgt-x-rate-mcp."
  outbound_http: "Requests are made solely to https://api.hacienda.go.cr."
---

# Costa Rica USD/CRC exchange rate

Use the `get_usd_crc_rate` tool from the `dgt-x-rate-mcp` MCP server to retrieve
official USD-to-CRC rates. The tool returns the DGT bid (`compra`) and selling
(`venta`) rates as CRC per USD. Do not estimate, recalculate, or substitute
unofficial rates.

## Set up the MCP server

Configure your MCP-compatible client to launch the published server through
npx:

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

The server uses stdio for MCP communication. Its rate requests go to
`https://api.hacienda.go.cr` only. Do not configure `DGT_BASE_URL` to point to a
different host.

### VS Code (GitHub Copilot)

1. Add the server to `.vscode/mcp.json`:

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

   Do not reuse the `mcpServers` wrapper in `.vscode/mcp.json`; that wrapper
   belongs to clients that use the generic MCP configuration format.
2. Open and trust the workspace.
3. From the Command Palette, run **MCP: List Servers**.
4. Start or restart `dgt-x-rate-mcp` and confirm that it is running.
5. Open Copilot Chat in Agent mode and enable `get_usd_crc_rate` in the chat
   tools/configuration menu.
6. Test it with:
   `Use get_usd_crc_rate to get today's official USD/CRC bid and selling rates`.

Server registration is not the same as tool selection for a chat. If VS Code
shows the server as enabled but the agent cannot see the tool, list/restart
the server and explicitly enable or request the tool.

### GitHub Copilot CLI

Register the server in your user configuration with
`copilot mcp add dgt-x-rate-mcp -- npx -y dgt-x-rate-mcp`. Then inspect it
with `/mcp list` and `/mcp get dgt-x-rate-mcp`.

Alternatively, add it to the workspace's `.mcp.json` using the
`mcpServers` format above. Copilot CLI does not read VS Code's
`.vscode/mcp.json`; workspace MCP configuration is loaded only when the folder
is trusted.

### Skill versus explicit MCP tool

This skill tells an agent how to choose, call, and interpret
`get_usd_crc_rate`. It requires the MCP server to be running, but it does not
install or start the server.

Use explicit MCP invocation when you want the result to be unambiguous:
`Use get_usd_crc_rate for today's official Costa Rica USD/CRC rates`.

Use the skill explicitly only when your agent client supports loading this
`SKILL.md` and you want it to apply the DGT date, validation, and reporting
instructions. In an agent that supports automatic skill discovery, a request
such as `Get today's official DGT USD/CRC bid and selling rates` may use this
skill or discover the MCP tool automatically. If discovery is uncertain,
name the server/tool explicitly.

## Choose the date

- For the rate available now, call `get_usd_crc_rate` without `date`. The
  server determines the current date using the `America/Costa_Rica` timezone;
  include the returned `date` when reporting the rate.
- For a historical or explicitly requested date, pass `date` as `YYYY-MM-DD`.
  The server calls the historical endpoint with both `d` and `h` set to that
  same date. Interpret dates in Costa Rica local business context
  (`America/Costa_Rica`). For example, use `"2026-11-21"`, not a localized
  date string.

## Interpret and apply the rates

- `bid` is the DGT `compra` rate: the CRC amount at which dollars are bought.
- `selling` is the DGT `venta` rate: the CRC amount at which dollars are sold.
- For a USD electronic invoice submitted to Hacienda, use the official
  reference selling (`venta`) rate applicable to the invoice date as the
  conversion reference. Do not use `bid` in its place. Confirm invoice-version
  and transaction-specific requirements with current Hacienda guidance or
  your accounting professional; this tool does not determine tax treatment.
- A requested rate may be unavailable on weekends, holidays, or for dates
  without published data. Do not assume a prior business day's rate applies
  and do not silently substitute another date. Report the returned date and
  ask whether the user wants a different date or an explicitly identified
  latest available rate.

## Handle errors

If the MCP result has `isError: true`, explain the error and do not present a
rate as successful. A missing historical entry or an upstream/API failure can
prevent retrieval. Do not invent a value or repeatedly retry a persistent
failure; ask the user to retry later or specify another date when appropriate.

## Example requests and responses

Prompt for today's rate:

> What are today's official USD/CRC compra and venta rates?

Call `get_usd_crc_rate` with no arguments. A successful response contains JSON
like:

```json
{
  "date": "2026-11-20",
  "currency": "USD",
  "targetCurrency": "CRC",
  "bid": 505.12,
  "selling": 511.45
}
```

Prompt for a historical date:

> Get the official USD/CRC rate for 2026-11-19 for an invoice conversion.

Call `get_usd_crc_rate` with `{"date":"2026-11-19"}`. For example, the
successful result is:

```json
{
  "date": "2026-11-19",
  "currency": "USD",
  "targetCurrency": "CRC",
  "bid": 505.12,
  "selling": 511.45
}
```

For invoicing, report and use `selling` as the reference rate, and preserve
the response date. Values above illustrate the response shape only; always
use the live tool result.
