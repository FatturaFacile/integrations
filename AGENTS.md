# AGENTS.md — Canonical Engineering & Quality Reference for AI Agents

> Single Source of Truth for all AI coding agents working on `FatturaFacile/integrations`.

---

## 1. Project & Stack Overview

- **Repository**: `FatturaFacile/integrations` (MIT License) — Enterprise integrations monorepo for FatturaFacile ERP.
- **Runtime & Toolchain**:
  - **Node.js**: `>=20.0.0`
  - **Package Manager**: `pnpm` (`>=9.0.0`, repo pinned to `pnpm@12.18.0`). Never use `npm` or `yarn`.
  - **Monorepo Engine**: Turborepo (`^2.4.2`), pnpm workspaces.
  - **Language**: TypeScript (`^5.7.3`, strict mode).
  - **Testing Framework**: Vitest (`^3.0.5`), `@vitest/coverage-v8` (`3.2.7`).
  - **Linter & Formatter**: ESLint 9 (`^9.20.1`, flat config), Prettier (`^3.5.1`).
- **Architectural Style**:
  - **OpenAPI-First**: ERP communication **MUST** strictly consume `@fatturafacile/openapi-sdk` through `createErpClient()` from `@fatturafacile/shared`. Ad-hoc HTTP calls, duplicate DTOs, or hand-rolled ERP fetch calls are strictly prohibited.
  - **Clean Architecture & Domain-Driven Design (DDD)**: Each package is structured into `domain/` (pure ports/entities), `application/` (use-case orchestration), and `infrastructure/` (external platform API clients, webhooks, adapters).
  - **Framework Connectors**: Every connector extends `BaseConnector` from `@fatturafacile/framework`.
  - **Mandatory `manifest.json`**: Each package must have a valid `manifest.json` declaring metadata, scopes, and supported ERP versions.
  - **Multi-Tenancy & Security**: Tenant cryptographic isolation (AES-256-GCM via `SecretManager` partitioned by `tenantId`), tenant-scoped rate limiting, caching, and audit logging.
- **Monorepo Folder Layout**:
  - `packages/openapi-sdk/`: Generated typed TypeScript client and models for FatturaFacile ERP.
  - `packages/shared/`: ERP client factory, structured logging, OpenTelemetry, crypto, queue, test utilities.
  - `packages/framework/`: `BaseConnector`, state machines, resilience (circuit breakers, token-bucket rate limiters), webhook verifiers.
  - `packages/{ecommerce,cms,marketplaces,payments,shipping,crm,accounting,identity,productivity,communication,ai,developer}/*`: Domain connector packages.
  - `tools/{tsconfig,eslint,vitest}/`: Shared configuration presets.
  - `scripts/`: Scaffolding utilities (`scaffold-integration.ts`).

---

## 2. Coding & Quality Standards

- **Strict TypeScript**: Strict mode enabled (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`).
- **Zero-Warning Tolerance**: Code must pass linting, formatting, and typechecking with zero errors and zero warnings.
- **Type Safety**: Never use `any`. Use `unknown` with runtime validation (Zod schemas or type guards) for external inputs and webhooks.
- **Language & Naming**:
  - All code, identifiers, comments, docstrings, and tests must be in English.
  - File naming: `kebab-case.ts`, unit tests: `*.spec.ts` or `*.test.ts`.
  - Interfaces: `PascalCase`, functions/variables: `camelCase`, constants: `UPPER_SNAKE_CASE`.
- **Security & Secrets**:
  - Never hardcode credentials, tokens, or API secrets in source files or tests.
  - Use test factories and dynamic mocks (`vi.fn()`, `vi.spyOn()`).

---

## 3. Exact Verification & Quality Gate Commands

Run all commands using `pnpm` from repository root:

```bash
# Dependency installation
pnpm install

# Build all workspace packages
pnpm build
# or run via turbo
pnpm exec turbo run build

# Type check all packages
pnpm typecheck
# or single package
pnpm --filter <package-name> typecheck

# Lint workspace
pnpm lint
# or single package
pnpm --filter <package-name> lint

# Code formatting
pnpm format:check
# Apply formatting fixes
pnpm format

# Run all unit/integration tests
pnpm test
# Run tests with coverage
pnpm test:coverage
# Run tests for a single package
pnpm --filter <package-name> test
# e.g., pnpm --filter @fatturafacile/integration-woocommerce test
```

---

## 4. AI Agent Workflow & Worktree Discipline

- **Workspace Isolation**: Always work in dedicated Git worktrees or feature branches (`git worktree add ../<repo>-<branch> -b <branch>`).
- **Pre-Completion Quality Gate**: Before marking any task as complete or opening a PR, always execute:
  1. `pnpm typecheck`
  2. `pnpm lint`
  3. `pnpm test`
- **Conventional Commits**: Commit messages must follow conventional format: `feat(scope): ...`, `fix(scope): ...`, `docs(scope): ...`, `chore(scope): ...`.
