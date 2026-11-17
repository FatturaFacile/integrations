# Antigravity Rules

See canonical project reference: [AGENTS.md](../AGENTS.md)

## Standards & Execution
- All engineering standards, TypeScript rules, and verification pipelines are defined in `AGENTS.md`.
- Quality gates before completing:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
- Always preserve multi-tenancy isolation, AES-256-GCM secret handling, and OpenAPI-first client usage.
