# FatturaFacile Integrations - Architecture & Engineering Guidelines for AI Agents

Read `.ai/rules/index.md` and `.ai/rules/project.md` before planning or editing code in this repository.

This repository (`FatturaFacile/integrations`, MIT License) is the enterprise-grade monorepo for all external connectors and integrations around the FatturaFacile ERP.

---

## 1. Golden Architecture Rules

1. **OpenAPI-First (Single Source of Truth)**:
   - ERP communication **MUST** go through `@fatturafacile/openapi-sdk`.
   - **STRICT PROHIBITION**: Never define duplicate DTOs, hand-written HTTP clients, or ad-hoc fetch calls towards the ERP API. Outgoing ERP calls must pass through `createErpClient()` in `@fatturafacile/shared`.
2. **Framework-Based Connectors**:
   - Every integration package must extend the core abstractions in `packages/framework`.
   - Leverage shared logging, telemetry, errors, and validation utilities from `packages/shared`.
3. **Mandatory `manifest.json`**:
   - Every integration package must contain a root `manifest.json` declaring:
     - `name`: `@fatturafacile/integration-<name>`
     - `description`: Purpose of the connector
     - `version`: SemVer string
     - `author`: Team / Author
     - `license`: `MIT`
     - `dependencies`: Dependency declarations
     - `permissions`: Required scopes / capabilities
     - `supportedErpVersion`: Target FatturaFacile version range
     - `supportedPlatforms`: Target environments (e.g. `["node>=20"]`)
4. **Architectural Principles**:
   - Domain-Driven Design (DDD), Clean Architecture, SOLID.
   - Separation of layers: `domain/` (pure business models/ports), `application/` (use-cases/orchestration), `infrastructure/` (external platform API clients, webhooks, adapters).
   - Event-driven, resilient (circuit breakers, exponential backoff, retry policies from framework), and multi-tenant by design.

---

## 2. TypeScript & Code Standards

- **TypeScript**: Strict mode enabled (`strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`).
- **Typing**: Prefer strong types and type inference. Avoid `any`; use `unknown` when input is uncertain and validate with runtime schemas (Zod or type-guards).
- **Style**: Functional, modular, decoupled, clean. Zero lint errors or warnings allowed.
- **Language**: All code, interfaces, comments, docstrings, and tests must be in English.

---

## 3. Package Management & Build Commands

- **Package Manager**: Use `pnpm` exclusively. Never run `npm` or `yarn`.
- **Monorepo Tools**: Turborepo for pipeline coordination.
  - Install dependencies: `pnpm install`
  - Build workspace: `pnpm build` (or `turbo run build`)
  - Run tests: `pnpm test` (or `turbo run test`)
  - Run single package test: `pnpm --filter @fatturafacile/<pkg> test`
  - Lint workspace: `pnpm lint` (or `turbo run lint`)
  - Typecheck: `pnpm typecheck` (or `turbo run typecheck`)

---

## 4. Testing Strategy

- **Vitest**: Unit tests, integration tests, contract tests.
- **Playwright**: End-to-end integration flows where headless browser verification is required.
- **Contract Testing**: Validate third-party webhooks and payload transformations against the schema.
- **Security in Specs**: Never hardcode real API credentials, keys, or passwords in test files. Use dynamic mocks and factories.

---

## 5. Phased Rollout by Priority Tier

When designing or implementing connectors, follow this incremental hierarchy:
- **Tier 1 (Production Ready)**: WooCommerce, Shopify, WordPress, Microsoft 365, Teams, Stripe, PayPal, Copilot, Claude, Cursor MCP.
- **Tier 2 (Enterprise Standard)**: Magento, Amazon, DHL, GLS, Google Workspace, Slack, HubSpot, Salesforce.
- **Tier 3 (Extended Ecosystem)**: PrestaShop, eBay, UPS, BRT, Open Banking, Peppol, Keycloak.
