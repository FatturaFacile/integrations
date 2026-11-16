@AGENTS.md

# Agent Rules & Instructions

Read in this order before planning or editing:
1. `AGENTS.md` (Architecture, TypeScript standards, and integration patterns)
2. `.ai/rules/index.md` and `.ai/rules/project.md` (Monorepo invariants, OpenAPI single source of truth, manifests)
3. `.github/copilot-instructions.md` (Monorepo execution guidelines, build/test/lint commands, token optimization)

Package manager: `pnpm` only. Never read or leak `.env*`, `.git/` or secrets.
OpenAPI SDK is the single source of truth: all ERP communication must use `@fatturafacile/openapi-sdk` via `createErpClient()` in `@fatturafacile/shared`. Never write manual ERP DTOs or HTTP calls.
