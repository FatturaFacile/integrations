# AGENTS.md — FatturaFacile/integrations

## Stack & Layout

- **Repo**: `FatturaFacile/integrations` (MIT) — ERP connectors, runtime bridges, and MCP servers.
- **Toolchain**: Node.js `>=20.0.0` (CI: v22), `pnpm@12.18.0` (`>=9.0.0`, NEVER `npm`/`yarn`; use `pnpm.cmd` on Windows if PowerShell blocks `pnpm`), Turborepo `^2.4.2`, TypeScript `^5.7.3` (`ES2022`/`NodeNext`), Vitest `^3.0.5` (`@vitest/coverage-v8`), ESLint 9 flat config, Prettier `^3.5.1`.
- **Core Packages**: `packages/openapi-sdk/` (generated ERP client/models), `packages/shared/` (`createErpClient()`, `Logger`, OpenTelemetry, AES-256-GCM/HMAC crypto, `secureCompare()`, queue, `test-utils`), `packages/framework/` (`BaseConnector`, `SecretManager`, rate limiter, circuit breaker, retry, webhook verifiers, marketplace, `manifest.schema.json`).
- **Connectors**: `packages/{ecommerce,cms,marketplaces,payments,shipping,crm,accounting,identity,productivity,communication,ai,developer}/*`.
- **Tooling**: `tools/{tsconfig,eslint,vitest}/`, `scripts/scaffold-integration.ts`.

## Architecture & Security

- **OpenAPI-First**: ALL ERP API calls MUST use `@fatturafacile/openapi-sdk` via `createErpClient()` (`@fatturafacile/shared`) or `this.getErp()` (`BaseConnector`). Hand-rolled ERP `fetch`/`axios` calls and duplicate ERP DTOs are strictly forbidden.
- **Clean Architecture (DDD)**: Separate `src/domain/` (pure models/ports), `src/application/` (use-case orchestration), and `src/infrastructure/` (external API clients/webhooks); tests in `test/*.spec.ts`.
- **Connectors & Manifests**: Every connector extends `BaseConnector` (`@fatturafacile/framework`) and includes a root `manifest.json` valid against `packages/framework/manifest.schema.json`.
- **AI / MCP Connectors**: `packages/ai/*` expose native Model Context Protocol (MCP) tools and OpenAPI resources.
- **Multi-Tenant Isolation**: Scope state, caches (`tenant:${tenantId}:*`), logs, events, and rate limits by `tenantId`.
- **Secrets & Webhooks**: Never hardcode credentials/tokens; encrypt via `SecretManager` (AES-256-GCM, key prefix `tenant:${tenantId}:secret:${name}`). Verify webhooks with HMAC-SHA256 + `secureCompare()` (`crypto.timingSafeEqual`) and replay protection.

## Coding, Types & Localization

- **Strict TypeScript**: Inherit `tools/tsconfig/base.json` (`strict`, `noImplicitAny`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`).
- **Zero `any` / Zero Warnings**: `@typescript-eslint/no-explicit-any` is an error; type external/webhook payloads as `unknown` and validate with Zod or type guards. Prefix intentionally unused args/vars with `_`; use structured `Logger` (`no-console` allows only `warn`/`error`/`info`).
- **Naming & Tests**: `kebab-case.ts` files, `*.spec.ts`/`*.test.ts` tests, `PascalCase` types/classes, `camelCase` functions/vars, `UPPER_SNAKE_CASE` constants. Use `@fatturafacile/shared/test-utils`, factories, and `vi.fn()`/`vi.spyOn()`.
- **Language & Localization**: Code, identifiers, comments, docstrings, and tests in English. User-facing/localized integration strings, templates, and Swiss/EU mappings MUST preserve all 4 FatturaFacile locales (`it`, `de`, `fr`, `en`) cleanly.

## Quality Gate Commands

- **Install**: `pnpm install` (CI: `pnpm install --frozen-lockfile`)
- **Typecheck**: `pnpm typecheck` | single pkg: `pnpm --filter <pkg> typecheck`
- **Lint**: `pnpm lint` | single pkg: `pnpm --filter <pkg> lint`
- **Build**: `pnpm build` | single pkg: `pnpm --filter <pkg> build`
- **Test**: `pnpm test` | coverage: `pnpm test:coverage` | single pkg: `pnpm --filter <pkg> test`
- **Format**: `pnpm format:check` | fix: `pnpm format`
- **Scaffold**: `pnpm run scaffold <category> <name> "<description>" <tier>`
- **Security Audit**: `pnpm audit --prod --audit-level=high`
- **Gate Rule**: NEVER push to `origin dev` unless `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm test` pass with zero errors and zero warnings.

## Strict Git Workflow (`dev` Only, Zero PRs, Zero Leftovers)

- **Workspace Isolation**: Develop feature/fix work in a linked worktree branched from `dev` (`git worktree add ../integrations-<branch> -b <branch> dev`).
- **Direct `dev` Integration**: Merge locally into `dev` only: `git checkout dev && git pull --rebase origin dev && git merge --no-ff <branch>` -> verify quality gates -> `git push origin dev`.
- **FORBIDDEN**: NEVER commit, merge, or push to `main`. NEVER create Pull Requests (`gh pr create` / `gh pr`).
- **Autonomous Conflict Resolution**: Resolve all merge conflicts autonomously while preserving Clean Architecture, strict TypeScript types, OpenAPI-first contracts, and all 4 locales (`it`, `de`, `fr`, `en`).
- **Conventional Commits**: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `chore(scope): ...`, `refactor(scope): ...`, `test(scope): ...`.
- **Mandatory End-of-Task Cleanup**: After pushing `dev`, ALWAYS delete merged local/remote feature branches (`git branch -D <branch>`, `git push origin --delete <branch>`), remove linked worktrees (`git worktree remove --force <path> && git worktree prune`), and delete temporary/debug files so `git status` is completely clean.
