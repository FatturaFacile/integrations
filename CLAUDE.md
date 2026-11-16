@AGENTS.md

# Agent Rules & Instructions

Read in this order before planning or editing code in this repository:
1. `AGENTS.md` (Architecture, TypeScript standards, and integration patterns)
2. `.ai/rules/index.md` and `.ai/rules/project.md` (Monorepo invariants, OpenAPI single source of truth, manifests)
3. `.github/copilot-instructions.md` (Monorepo execution guidelines, build/test/lint commands, token optimization)

## Golden Invariants
- **Package Manager**: Use `pnpm` only. Never run `npm` or `yarn`.
- **OpenAPI SDK Only**: All ERP calls must use `@fatturafacile/openapi-sdk`. Writing manual HTTP calls or duplicate DTOs to ERP is strictly forbidden. Outgoing ERP calls must pass through `createErpClient()` in `@fatturafacile/shared`.
- **Framework & Shared Packages**: All connectors must extend `packages/framework` and use `packages/shared`.
- **Plugin Manifest**: Every integration package must provide a valid `manifest.json`.
- **Security**: Never read, print, or leak `.env*`, `auth.json`, or secret certificates in `certs/`.
