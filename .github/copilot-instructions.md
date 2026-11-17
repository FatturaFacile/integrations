# GitHub Copilot Instructions

See canonical project specification: [AGENTS.md](../AGENTS.md)

## Key Constraints for FatturaFacile Integrations Monorepo
- **Stack**: Node.js >=20, pnpm workspaces (`pnpm@12.18.0`), Turborepo, TypeScript (strict), Vitest 3, ESLint 9.
- **OpenAPI-First**: Never create duplicate DTOs or hand-written HTTP calls to the ERP. All ERP API requests MUST use `@fatturafacile/openapi-sdk` and `createErpClient()` in `@fatturafacile/shared`.
- **Connectors**: Every connector must extend `BaseConnector` from `@fatturafacile/framework` and include a root `manifest.json`.
- **Clean Architecture**: Strictly separate `domain/`, `application/`, and `infrastructure/`.
- **Type Safety**: Strictly avoid `any`. Use `unknown` and validate with Zod or type guards for external payloads.
- **Verification Commands**:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test` (or `pnpm --filter <package-name> test`)
  - `pnpm format:check`
