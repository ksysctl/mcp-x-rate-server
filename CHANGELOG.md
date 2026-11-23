# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [1.4.0](https://github.com/ksysctl/mcp-x-rate-server/compare/dgt-x-rate-mcp-v1.3.0...dgt-x-rate-mcp-v1.4.0) (2026-11-22)


### Features

* add DGT USD to CRC MCP server ([4472b3d](https://github.com/ksysctl/mcp-x-rate-server/commit/4472b3d41dfa54ca38a6e95dc5ab9c83dfbc14bf))
* assign PRs and improve npm release workflow ([fd1bcce](https://github.com/ksysctl/mcp-x-rate-server/commit/fd1bcce487bb2595f880cfbf2874af52f58a88ef))
* assign pull requests to ksysctl by default ([71a21b1](https://github.com/ksysctl/mcp-x-rate-server/commit/71a21b157d9598bcdb4fbb9a038f2562f48ae410))
* automate npm package releases ([#6](https://github.com/ksysctl/mcp-x-rate-server/issues/6)) ([4458dfc](https://github.com/ksysctl/mcp-x-rate-server/commit/4458dfcaf8a353159195851ad6c316e042acb70a))
* prepare 1.3.0 release ([#13](https://github.com/ksysctl/mcp-x-rate-server/issues/13)) ([8e99687](https://github.com/ksysctl/mcp-x-rate-server/commit/8e99687e9d0067f765324ceef39d744011af996c))


### Bug Fixes

* support npm release retries ([bdcc56f](https://github.com/ksysctl/mcp-x-rate-server/commit/bdcc56f560e57e9828625520f8cbb97d1b306463))
* support npm release retries ([#9](https://github.com/ksysctl/mcp-x-rate-server/issues/9)) ([c07ac21](https://github.com/ksysctl/mcp-x-rate-server/commit/c07ac2153d5804aaad2e3c41085a4cddb2b1aa8f))
* use default Release Please config filename ([#7](https://github.com/ksysctl/mcp-x-rate-server/issues/7)) ([082bc23](https://github.com/ksysctl/mcp-x-rate-server/commit/082bc231058dddafb3a05bbfa01d23af37037779))

## [1.3.0] - 2026-11-22

### Added

- Add the `dgt-x-rate` Agent Skill with VS Code and Copilot CLI setup guidance.
- Add a `package:skill` script to package the skill for upload.

### Fixed

- Update DGT API requests to use the official `api.hacienda.go.cr/indicadores/tc/dolar` endpoints.

## [1.2.0](https://github.com/ksysctl/mcp-x-rate-server/compare/dgt-x-rate-mcp-v1.1.1...dgt-x-rate-mcp-v1.2.0) (2026-11-22)


### Features

* assign PRs and improve npm release workflow ([fd1bcce](https://github.com/ksysctl/mcp-x-rate-server/commit/fd1bcce487bb2595f880cfbf2874af52f58a88ef))
* assign pull requests to ksysctl by default ([71a21b1](https://github.com/ksysctl/mcp-x-rate-server/commit/71a21b157d9598bcdb4fbb9a038f2562f48ae410))

## [1.1.1](https://github.com/ksysctl/mcp-x-rate-server/compare/dgt-x-rate-mcp-v1.1.0...dgt-x-rate-mcp-v1.1.1) (2026-11-22)


### Bug Fixes

* support npm release retries ([#9](https://github.com/ksysctl/mcp-x-rate-server/issues/9)) ([c07ac21](https://github.com/ksysctl/mcp-x-rate-server/commit/c07ac2153d5804aaad2e3c41085a4cddb2b1aa8f))

## [1.1.0](https://github.com/ksysctl/mcp-x-rate-server/compare/dgt-x-rate-mcp-v1.0.0...dgt-x-rate-mcp-v1.1.0) (2026-11-22)


### Features

* add DGT USD to CRC MCP server ([4472b3d](https://github.com/ksysctl/mcp-x-rate-server/commit/4472b3d41dfa54ca38a6e95dc5ab9c83dfbc14bf))
* automate npm package releases ([#6](https://github.com/ksysctl/mcp-x-rate-server/issues/6)) ([4458dfc](https://github.com/ksysctl/mcp-x-rate-server/commit/4458dfcaf8a353159195851ad6c316e042acb70a))


### Bug Fixes

* use default Release Please config filename ([#7](https://github.com/ksysctl/mcp-x-rate-server/issues/7)) ([082bc23](https://github.com/ksysctl/mcp-x-rate-server/commit/082bc231058dddafb3a05bbfa01d23af37037779))

## [Unreleased]

### Added

- Add npm package metadata and automated Release Please/npm publishing workflow.

### Changed

- Standardize Release Please tags to `v<version>` and shorten generated release PR titles.
- Synchronize `skills/dgt-x-rate/SKILL.md` with package releases.
- Protect `main` and require `release/*` or Release Please PR sources.

### Fixed

- Build release output before publishing and allow manual retries for an existing release tag.
- Add deterministic end-to-end MCP coverage for stdio initialization, tool discovery, and tool invocation.
- Use ESLint `defineConfig()` and `globalIgnores()` for the supported flat configuration API.

## [1.0.0] - 2026-11-22

### Fixed
- Improve ESLint verification with vertical-spacing rules and clean formatting across the DGT client and MCP helper.

### Documentation
- Add JSDoc to exported APIs and document the JSDoc maintenance requirement.
- Correct the README API host and project structure.

### Changed
- Refactor the DGT client into an instance-based API with isolated 15-minute caches and shared MCP helpers.
- Upgrade GitHub Actions to Node 24-compatible versions and run CI on Node.js 24.

## - 2026-11-21

### Added
- MCP server (`dgt-x-rate-mcp`) over `stdio` transport using `@modelcontextprotocol/sdk`.
- `get_usd_crc_rate` tool to fetch current and historical USD to CRC bid (*compra*) and selling (*venta*) exchange rates from Costa Rica's DGT / Ministerio de Hacienda API.
- `dgtClient` HTTP client with 15-minute in-memory TTL caching and `America/Costa_Rica` timezone fallback.
- Strict TypeScript configuration, ESLint (`strictTypeChecked`) rules, and unit tests via `node:test`.
- Project documentation (`README.md`), Copilot instructions (`AGENTS.md`), and custom development/release skills.
