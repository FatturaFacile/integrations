# Claude Code Guidelines

@AGENTS.md

## Claude-Specific Directives & Worktree Discipline
- **Reference**: Always follow the canonical architectural standards, strict typing, and security policies defined in `@AGENTS.md`.
- **Worktree Isolation**: Perform all non-trivial changes within an isolated Git worktree or feature branch.
- **Verification Gates**: Always verify changes before completion by executing:
  1. `pnpm typecheck`
  2. `pnpm lint`
  3. `pnpm test` (or `pnpm --filter <pkg> test` for targeted changes)
- **Zero Hallucination / Zero Duplication**: Do not create duplicate DTOs or custom HTTP requests to FatturaFacile ERP. Always use `@fatturafacile/openapi-sdk` and `@fatturafacile/shared`.
