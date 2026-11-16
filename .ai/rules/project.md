# FatturaFacile Integrations - AI & Agent Working Rules

This file is the single source of truth for cross-tool AI rules in this repository (`FatturaFacile/integrations`, MIT License).
Tool entry points (`AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.windsurfrules`, `.agy/instructions.md`, `.gemini/GEMINI.md`, `.github/copilot-instructions.md`) point here.

---

## 1. Project Context & Architecture

- **Repository**: `FatturaFacile/integrations` (Open Source ERP Ecosystem, MIT License).
- **Mission**: Enterprise-grade monorepo for all external integrations connecting to the FatturaFacile Open Source ERP:
  - E-commerce & Marketplaces (WooCommerce, Shopify, Magento, Amazon, eBay, etc.)
  - CMS (WordPress, Umbraco, etc.)
  - Payments & Gateways (Stripe, PayPal, Mollie, Adyen, etc.)
  - Shipping & Logistics (DHL, GLS, UPS, BRT, etc.)
  - Productivity & Office (Microsoft 365, Teams, Google Workspace, Slack, etc.)
  - CRM & Marketing (HubSpot, Salesforce, Mailchimp, Brevo, etc.)
  - Accounting & Banking (Open Banking, Peppol, CBI, etc.)
  - Identity & SSO (OAuth2, OIDC, SAML, Keycloak, Entra ID, etc.)
  - AI & MCP Connectors (Anthropic Claude, OpenAI, Gemini, Microsoft Copilot, Cursor, Model Context Protocol servers)
- **Core Principles**: API-First, OpenAPI-First, MCP-Native, AI-First, Multi-Tenant, Event-Driven, Clean Architecture, SOLID, Domain-Driven Design (DDD).

---

## 2. Golden Rule: OpenAPI is the Single Source of Truth

> **CRITICAL MANDATE - ZERO TOLERANCE**:
> - All communication with the FatturaFacile ERP API **MUST** use the official client: `@fatturafacile/openapi-sdk`.
> - **IT IS STRICTLY FORBIDDEN** to write:
>   - Handwritten or duplicate DTOs/interfaces representing ERP entities.
>   - Manual HTTP client wrappers (e.g. raw `fetch`, `axios`, `curl`) towards the ERP endpoints.
>   - Hardcoded URL routes or custom serialization logic for ERP contracts.
> - Whenever ERP contracts, data shapes, or endpoints are required, import them exclusively from `@fatturafacile/openapi-sdk` (or the corresponding typed package dependency).

---

## 3. Technology Stack & Monorepo Structure

- **Package Manager**: `pnpm` (workspaces) exclusively (`pnpm-lock.yaml`). Never use `npm` or `yarn`.
- **Build System**: `Turborepo` (`turbo run build`, `turbo run test`, `turbo run lint`).
- **Core Runtime & Language**: TypeScript (strict mode, latest stable), Node.js (latest LTS).
- **Multi-Runtime Plugins**:
  - PHP/Laravel for dedicated CMS/e-commerce plugins (WordPress/WooCommerce, Magento, PrestaShop, Sylius).
  - C#/.NET for dedicated .NET ecosystems (Umbraco, Kentico, DNN).
  - The core integration framework, orchestrators, and MCP servers remain TypeScript-based.
- **Directory Layout**:
  - `apps/`: Standalone services, runtimes, MCP servers, gateway orchestrators.
  - `packages/framework/`: Core integration interfaces, abstract base connector, lifecycle hooks, retry policies, tenant context, event dispatchers.
  - `packages/shared/`: Cross-cutting utilities, logger, telemetry, validation helpers, crypto, currency/tax calculations.
  - `packages/{ecommerce,cms,marketplaces,productivity,payments,shipping,crm,accounting,identity,communication,ai,developer}/*`: Dedicated integration packages.
  - `docs/`: Technical and integration guides.
  - `examples/`: Reference setups and quickstarts.
  - `scripts/`: Monorepo build and development automation scripts.
  - `tests/`: Shared test fixtures and integration test harnesses.
  - `tools/`: Scaffolding, CLI, and generator utilities.
  - `.github/`: CI/CD workflows, issue templates, and Copilot configurations.

---

## 4. How to Generate New Connectors & Plugins

Every new connector or plugin must follow this exact pattern:

1. **Extend Base Connector**:
   - Inherit from the base connector abstraction in `packages/framework`.
   - Utilize common utilities, logging, validation, and error-handling from `packages/shared`.
2. **ERP Interaction via SDK**:
   - Consume `@fatturafacile/openapi-sdk` for all ERP operations and type contracts.
3. **Mandatory `manifest.json`**:
   Every integration package must provide a valid `manifest.json` at its root containing:
   ```json
   {
     "name": "@fatturafacile/integration-<name>",
     "description": "<Concise description of the integration>",
     "version": "1.0.0",
     "author": "FatturaFacile Team",
     "license": "MIT",
     "dependencies": { ... },
     "permissions": [ ... ],
     "supportedErpVersion": ">=2.0.0",
     "supportedPlatforms": ["node>=20", "..."]
   }
   ```
4. **Clean Architecture Separation**:
   - `domain/`: Business entities and integration contracts.
   - `application/`: Use cases, mapping logic, orchestration handlers.
   - `infrastructure/`: Third-party external API clients, webhook receivers, SDK adapters.

---

## 5. Development Workflow & Phased Tier Rollout

Always plan the architecture before generating code and prioritize implementations by Tier:
- **Tier 1 (Production Ready)**: WooCommerce, Shopify, WordPress, Microsoft 365, Teams, Stripe, PayPal, Copilot, Claude, Cursor.
- **Tier 2 (High Priority Enterprise)**: Magento, Amazon, DHL, GLS, Google Workspace, Slack, HubSpot, Salesforce.
- **Tier 3 (Extended Ecosystem)**: PrestaShop, eBay, UPS, BRT, Open Banking, Peppol, Keycloak, etc.

---

## 6. Commands & Verification

- Install dependencies: `pnpm install`
- Build workspace: `pnpm build` (or `turbo run build`)
- Run tests: `pnpm test` (or `turbo run test`)
- Run linting: `pnpm lint` (or `turbo run lint`)
- Format code: `pnpm run format`

Zero lint warnings, strict TypeScript typing, and 100% contract compliance are required before submitting changes.

---

## 7. Security, Sandboxing & Hygiene

- **Secrets & Credentials**: Never write API keys, client secrets, passwords, or tokens in source code or tests. Spec files must generate fake credentials dynamically at runtime.
- **Environment**: Never read, commit, or leak `.env*` files (except `.env.example`).
- **Language**: All code, identifiers, tests, documentation, and commit messages must be in English. Conversational replies to the user follow the language of the prompt.
