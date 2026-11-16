# Agent Optimization & Execution Guidelines

## Context & Token Saving Rules

1. **Focused inspections**: Inspect specific interfaces, exports, and function signatures rather than dumping large files.
2. **Concise diffs only**: Keep edits targeted; avoid re-writing unchanged code.
3. **No conversational filler**: Start directly with the required code, plan, or command execution.
4. **No unsolicited boilerplate explanations**: Explain architectural decisions only when explicitly requested.

---

## Monorepo Architecture & Package Management

- **Repository**: `FatturaFacile/integrations` (MIT License) - Enterprise Monorepo for all external integrations.
- **Package Manager**: **pnpm** (workspaces) exclusively. Never run `npm` or `yarn`. Install dependencies with `pnpm install --frozen-lockfile` (or `pnpm install`).
- **Build System**: **Turborepo** (`turbo run build`, `turbo run test`, `turbo run lint`).
- **Directory Structure**:
  - `apps/`: Gateway orchestrators, standalone runtimes, MCP servers.
  - `packages/framework/`: Core connector base class, event dispatcher, tenant context, resilience policies.
  - `packages/shared/`: Shared utilities, logger, telemetry, validation, crypto, formatting.
  - `packages/{ecommerce,cms,marketplaces,productivity,payments,shipping,crm,accounting,identity,communication,ai,developer}/*`: Specific integration packages.
  - `docs/`, `examples/`, `scripts/`, `tests/`, `tools/`.

---

## Mandatory ERP API Invariants (CRITICAL)

- **Single Source of Truth**: `@fatturafacile/openapi-sdk` is the ONLY allowed way to talk to FatturaFacile ERP. All outgoing ERP calls must pass through `createErpClient()` in `@fatturafacile/shared`.
- **FORBIDDEN**:
  - Writing manual HTTP requests (fetch, axios, curl) to the ERP.
  - Creating duplicate DTOs or hand-written interfaces for ERP resources.
  - Bypassing the OpenAPI SDK.

---

## Connector Implementation Rules

1. **Extend Base Connector**: Extend classes from `packages/framework`.
2. **Manifest Requirement**: Include a comprehensive `manifest.json` at the root of every connector package:
   - `name`, `description`, `version`, `author`, `license`, `dependencies`, `permissions`, `supportedErpVersion`, `supportedPlatforms`.
3. **Multi-Runtime Integration**:
   - TypeScript is the core language.
   - For ecosystem-specific runtimes (PHP for WordPress/WooCommerce/PrestaShop/Magento, C# for .NET/Umbraco), follow clean architecture principles, maintaining TypeScript for the core orchestration/MCP layer.
4. **Incremental Tier Progression**:
   - **Tier 1 (Production Ready)**: WooCommerce, Shopify, WordPress, Microsoft 365, Teams, Stripe, PayPal, Copilot, Claude, Cursor.
   - **Tier 2**: Magento, Amazon, DHL, GLS, Google Workspace, Slack, HubSpot, Salesforce.
   - **Tier 3**: PrestaShop, eBay, UPS, BRT, Open Banking, Peppol, Keycloak.

---

## Build, Test, and Lint Commands

- `pnpm install`: Install workspace dependencies.
- `pnpm build` or `turbo run build`: Build all packages and applications.
- `pnpm test` or `turbo run test`: Run the test suite via Vitest.
- `pnpm --filter @fatturafacile/<connector-name> test`: Run tests for a specific package.
- `pnpm lint` or `turbo run lint`: Run ESLint checks across the workspace.
- `pnpm format:check`: Verify Prettier formatting.

---

## Security & Secrets

- Never hardcode or commit API keys, secrets, client tokens, or passwords in source code or tests.
- Never read, display, or leak `.env*` files (except `.env.example`).
- Test specs must use runtime factories or mocks for authentication tokens and credentials.
