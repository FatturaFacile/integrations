# JetBrains AI Assistant & Junie Guidelines

Canonical reference: [AGENTS.md](../AGENTS.md)

## Core Directives
- **Architecture**: Domain-Driven Design (DDD) & Clean Architecture (`domain/`, `application/`, `infrastructure/`).
- **ERP Integration**: Never hand-write HTTP endpoints or duplicate DTOs for the ERP; consume `@fatturafacile/openapi-sdk` and `@fatturafacile/shared`.
- **Connector Pattern**: Extend `BaseConnector` from `@fatturafacile/framework` and provide a valid `manifest.json`.
- **Quality Gates & Commands**:
  - Build: `pnpm build`
  - Typecheck: `pnpm typecheck`
  - Lint: `pnpm lint`
  - Tests: `pnpm test` (or `pnpm --filter <package-name> test`)
