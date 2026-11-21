---
name: check-and-fix
description: Runs ESLint, TypeScript build, and unit tests via `npm run check`, then fixes any lint, type, or test failures while respecting AGENTS.md.
---

# Lint, Type-Check, and Test Fixer

When this skill is invoked:

1. **Run full verification**: Execute `npm run check` (`npm run lint && npm test`) in the terminal.
2. **Auto-fix safe lint issues**: If ESLint reports formatting or auto-fixable errors, run `npx eslint src tests --fix`.
3. **Fix remaining TypeScript & ESLint errors manually**:
   - Never use `any`, `@ts-ignore`, or `eslint-disable` comments to silence errors.
   - Replace any `console.log` with `console.error`.
   - Ensure local imports use `.js` extensions and type-only imports use `import type`.
   - Handle `noUncheckedIndexedAccess` safely (check for `undefined` before accessing array elements).
4. **Verify tests**: Ensure all unit tests in `tests/` pass and add test cases if a bug was uncovered.
5. **Final confirmation**: Re-run `npm run check` until it exits with code `0`.
