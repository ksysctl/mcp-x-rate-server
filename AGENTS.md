# Project Instructions: DGT X Rate MCP Server

## Stack & Commands
- **Runtime**: Node.js >= 22, TypeScript (`strict`, `noUncheckedIndexedAccess`, `Node16` modules).
- **MCP SDK**: `@modelcontextprotocol/sdk` (`McpServer` + `StdioServerTransport`).
- **Build**: `npm run build` (outputs to `build/src/index.js`).
- **Lint**: `npm run lint` (ESLint `strictTypeChecked`).
- **Test**: `npm test` (builds first, then runs `node --test` on `build/tests/**/*.spec.js`).
- **Full Verification**: Always run `npm run check` before finishing any task.

## TypeScript & Best Practices Rules
- **No `any` or unsafe assertions**: Narrow `unknown` payloads properly; avoid `as` casts unless validated.
- **Explicit return types**: Always declare return types on exported functions.
- **Type-only imports**: Use `import type { ... }` for types and interfaces.
- **Relative `.js` extensions**: All local imports in `src/` and `tests/` must end with `.js` (e.g., `./dgtClient.js`).
- **Timezone**: Always use `America/Costa_Rica` when deriving local current dates.
- **JSDoc**: When changing code, update its existing JSDoc. If JSDoc is missing from the relevant exported class, function, method, or type, add it.
- **Always**: follow the formatting and vertical spacing rules defined in the `check-and-fix` skill before finishing any code generation or modification.

## Critical MCP & DGT API Rules
- **Never use `console.log()`**: `stdout` is reserved for JSON-RPC frames. Use `console.error()` only (enforced by ESLint `no-console`).
- **Cache DGT API calls**: Respect DGT rate limits (max 20 req/s burst) by keeping in-memory TTL caching in `src/dgtClient.ts`.
- **Graceful tool errors**: Catch errors inside MCP tool handlers and return `{ content: [{ type: "text", text: "..." }], isError: true }`.
- **Unit tests required**: Every new client method or tool change must include mocked unit tests in `tests/`.
