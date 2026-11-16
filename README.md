# FatturaFacile Integrations

[![CI](https://github.com/FatturaFacile/integrations/actions/workflows/ci.yml/badge.svg)](https://github.com/FatturaFacile/integrations/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2-blueviolet.svg)](https://turbo.build/)
[![Vitest](https://img.shields.io/badge/Vitest-v3-yellow.svg)](https://vitest.dev/)

Enterprise-grade monorepo containing all connectors, runtime bridges, polyglot plugins, and **Model Context Protocol (MCP)** servers connecting external digital platforms (E-Commerce, CMS, Marketplaces, Payments, Shipping, CRM, Accounting, Identity, Productivity, and AI Agents) to the **FatturaFacile Open Source ERP**.

---

## 🌟 Core Architectural Principles

1. **OpenAPI-First (Single Source of Truth)**:
   - All communication with the ERP API **strictly** consumes [`@fatturafacile/openapi-sdk`](./packages/openapi-sdk).
   - **Zero Tolerance Policy**: Hand-written DTOs, duplicate models, or ad-hoc `fetch`/`axios` calls to ERP endpoints are strictly prohibited and enforced via compile-time lint rules.
2. **Framework-Based Architecture**:
   - Every connector extends `BaseConnector` from [`@fatturafacile/framework`](./packages/framework).
   - Built-in resilience: Token-bucket rate limiters, circuit breakers with exponential backoff, and state machine lifecycle hooks.
3. **Multi-Tenant by Design**:
   - Cryptographic tenant isolation: Secrets encrypted with AES-256-GCM via `SecretManager` partitioned by `tenantId`.
   - Tenant-scoped caching, event dispatching, and audit logging.
4. **AI-First & MCP-Native**:
   - Native Model Context Protocol (MCP) servers and declarative agents for **Anthropic Claude**, **Cursor IDE**, and **Microsoft 365 Copilot**.
5. **Clean Architecture (DDD)**:
   - Strict separation of concerns within each integration: `domain/` (pure contracts), `application/` (use-case orchestration), and `infrastructure/` (external platform API clients & webhooks).

---

## 🗂️ Monorepo Structure

```
integrations/
├── apps/                               # Developer playground, webhook simulator, documentation site
├── packages/
│   ├── openapi-sdk/                    # Official typed TypeScript SDK client & models for FatturaFacile ERP
│   ├── shared/                         # Client factory, structured logger, OpenTelemetry, crypto, queue, test-utils
│   ├── framework/                      # BaseConnector, lifecycle, security, resilience, webhook verifiers, marketplace engine
│   │
│   ├── ecommerce/                      # woocommerce, shopify, magento, prestashop
│   ├── cms/                            # wordpress, drupal, joomla, strapi
│   ├── marketplaces/                   # amazon, ebay, etsy
│   ├── payments/                       # stripe, paypal, twint, postfinance, mollie, adyen
│   ├── shipping/                       # dhl, gls, ups, brt, swisspost
│   ├── crm/                            # hubspot, salesforce, pipedrive
│   ├── accounting/                     # open-banking, peppol, bexio, abacus, datev
│   ├── identity/                       # keycloak, auth0, entra-id
│   ├── productivity/                   # microsoft365, teams, google-workspace, slack
│   ├── communication/                  # mailchimp, brevo, sendgrid, telegram
│   ├── ai/                             # copilot, claude, cursor, chatgpt, gemini
│   └── developer/                      # postman (automated OpenAPI collection generation), insomnia, bruno
├── tools/
│   ├── tsconfig/                       # Shared tsconfig presets (@fatturafacile/tsconfig)
│   ├── eslint/                         # Shared ESLint 9 configuration (@fatturafacile/eslint-config)
│   └── vitest/                         # Shared Vitest configuration with v8 coverage (@fatturafacile/vitest-config)
├── scripts/
│   ├── scaffold-integration.ts         # Scaffolding CLI for generating clean-architecture packages
│   └── generate-all-tiers.ts           # Bulk generator for Tier-2 and Tier-3 connectors
├── docs/                               # Architectural Decision Records (ADRs) and Developer Guides
├── Dockerfile                          # Multi-stage production container build
├── docker-compose.yml                  # Local development environment (Playground, Redis, WireMock)
├── pnpm-workspace.yaml                 # PNPM workspaces configuration
└── turbo.json                          # Turborepo task pipeline configuration
```

---

## 🚀 Delivery Tiers & Connector Catalog

### Tier 1: Full Production Ready (Complete Implementations)
| Connector | Category | Description |
| :--- | :--- | :--- |
| **`@fatturafacile/integration-woocommerce`** | E-Commerce | Bidirectional order sync, customer creation, invoice generation, payment registration, and HMAC-SHA256 webhook handler. |
| **`@fatturafacile/integration-shopify`** | E-Commerce | Real-time order sync, Credit Note generation for online returns/refunds, and Shopify HMAC webhook verifier. |
| **`@fatturafacile/integration-wordpress`** | CMS | Customer portal integration, authenticated invoice query, and tokenized secure PDF downloads. |
| **`@fatturafacile/integration-stripe`** | Payments | Automatic reconciliation for `payment_intent.succeeded`, charge refund processing, and anti-replay webhook verification. |
| **`@fatturafacile/integration-paypal`** | Payments | Instant capture processing (`PAYMENT.CAPTURE.COMPLETED`), ERP payment recording, and invoice status updates. |
| **`@fatturafacile/integration-microsoft365`** | Productivity | Microsoft Graph API integration: automated invoice dispatch via Outlook and due date reminders on Outlook Calendar. |
| **`@fatturafacile/integration-teams`** | Productivity | Interactive **Adaptive Cards** on Microsoft Teams channels for invoice issuance alerts and one-click portal links. |
| **`@fatturafacile/integration-copilot`** | AI | Microsoft 365 Copilot Declarative Agent with tools: `customer_lookup`, `invoice_create`, `quote_create`, `reporting`. |
| **`@fatturafacile/integration-claude`** | AI | Production **Anthropic Claude Model Context Protocol (MCP)** server providing accounting tools and OpenAPI resources. |
| **`@fatturafacile/integration-cursor`** | AI | Developer **Cursor IDE MCP** server for live schema inspection, testing, and automated invoice drafting. |

### Tier 2: Enterprise Standard
* **`ecommerce/magento`**: Magento 2 multi-store sync & B2B order handling.
* **`marketplaces/amazon`**: Amazon Seller Central order intake and shipment confirmations.
* **`shipping/dhl`**: DHL Express shipment creation, tracking numbers, and label generation.
* **`shipping/gls`**: GLS logistics, parcel tracking, and domestic carrier bridge.
* **`productivity/google-workspace`**: Gmail invoice notifications and Google Drive PDF archiving.
* **`productivity/slack`**: Slack notifications and interactive approval action buttons.
* **`crm/hubspot`**: HubSpot CRM contact, deal, and invoice synchronization.
* **`crm/salesforce`**: Salesforce Enterprise account billing, contracts, and order bridge.

### Tier 3: Extended Ecosystem & Swiss Localization
* **`ecommerce/prestashop`**: PrestaShop catalog and order sync.
* **`marketplaces/ebay`**: eBay marketplace order import and stock updates.
* **`shipping/ups`**: UPS worldwide logistics, commercial invoices, and labels.
* **`shipping/brt`**: BRT Bartolini Italian parcel logistics.
* **`accounting/open-banking`**: PSD2 Open Banking bank feeds and payment reconciliation.
* **`accounting/peppol`**: Peppol eDelivery Network BIS Billing 3.0 electronic invoicing connector.
* **`identity/keycloak`**: Keycloak IAM OAuth2, OIDC SSO, and SCIM directory synchronization.
* **`accounting/bexio`**: Swiss Bexio accounting export, VAT rates, and QR-bill sync.
* **`accounting/abacus`**: Swiss Abacus ERP enterprise booking ledger bridge.
* **`shipping/swisspost`**: Swiss Post barcode shipping labels and tracking.
* **`payments/twint`**: Swiss TWINT mobile payment registration and reconciliation.
* **`payments/postfinance`**: Swiss PostFinance Checkout payment gateway.
* **`developer/postman`**: Automated Postman v2.1 collection generator derived directly from OpenAPI.

---

## 🛠️ Developer Quickstart

### Prerequisites
* **Node.js**: LTS (`>=20.0.0`, recommended `v22+`)
* **Package Manager**: **`pnpm`** (`>=9.0.0`) exclusively. Never run `npm` or `yarn`.

### Setup & Commands
```bash
# 1. Install workspace dependencies
pnpm install

# 2. Build the entire monorepo with Turborepo
pnpm run build

# 3. Run all unit and contract tests across all 37 packages
pnpm run test

# 4. Run tests with coverage reports (V8 provider)
pnpm run test:coverage

# 5. Typecheck all packages
pnpm run typecheck

# 6. Run linter across all packages
pnpm run lint

# 7. Scaffold a new integration package
pnpm run scaffold <category> <name> "<description>" <tier>
# Example:
pnpm run scaffold ecommerce medusajs "Medusa.js headless commerce connector" 2
```

---

## 🔒 Security Architecture

* **Zero Plaintext Secrets**: API keys, OAuth tokens, and secrets are encrypted with AES-256-GCM using `SecretManager`.
* **Webhook Verification**: Dedicated verifiers with constant-time equality checks (`crypto.timingSafeEqual`) prevent timing attacks:
  * Stripe: Timestamped HMAC-SHA256 (`stripe-signature`) with 300-second replay tolerance.
  * Shopify: Base64 HMAC-SHA256 (`x-shopify-hmac-sha256`).
  * WooCommerce: Base64 HMAC-SHA256 (`x-wc-webhook-signature`).
  * Generic: Hex HMAC-SHA256 (`x-hub-signature-256`).
* **Multi-Tenant Boundaries**: Every event, request, and cache entry is strictly scoped by `tenantId`.

---

## 📜 Mandatory `manifest.json` Specification

Every integration package must include a root `manifest.json` conforming to `packages/framework/manifest.schema.json`:

```json
{
  "name": "@fatturafacile/integration-woocommerce",
  "description": "Production WooCommerce e-commerce bidirectional synchronization",
  "version": "1.0.0",
  "author": "FatturaFacile Team",
  "license": "MIT",
  "category": "ecommerce",
  "tier": 1,
  "dependencies": {
    "@fatturafacile/framework": "workspace:*",
    "@fatturafacile/shared": "workspace:*"
  },
  "permissions": [
    "invoices:read",
    "invoices:write",
    "customers:read",
    "customers:write",
    "webhooks:manage"
  ],
  "supportedErpVersion": ">=2.0.0",
  "supportedPlatforms": ["node>=20"]
}
```

---

## 📄 License

This repository is licensed under the [MIT License](./LICENSE). Copyright (c) FatturaFacile Team.
