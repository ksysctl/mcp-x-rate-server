# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Documentation
- Add JSDoc to exported APIs and document the JSDoc maintenance requirement.
- Correct the README API host and project structure.

### Changed
- Upgrade GitHub Actions to Node 24-compatible versions and run CI on Node.js 24.

## - 2026-11-21

### Added
- MCP server (`dgt-x-rate-mcp`) over `stdio` transport using `@modelcontextprotocol/sdk`.
- `get_usd_crc_rate` tool to fetch current and historical USD to CRC bid (*compra*) and selling (*venta*) exchange rates from Costa Rica's DGT / Ministerio de Hacienda API.
- `dgtClient` HTTP client with 15-minute in-memory TTL caching and `America/Costa_Rica` timezone fallback.
- Strict TypeScript configuration, ESLint (`strictTypeChecked`) rules, and unit tests via `node:test`.
- Project documentation (`README.md`), Copilot instructions (`AGENTS.md`), and custom development/release skills.
