# FatturaFacile Integrations

[![CI](https://github.com/FatturaFacile/integrations/actions/workflows/ci.yml/badge.svg)](https://github.com/FatturaFacile/integrations/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-12.x-orange.svg)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2-blueviolet.svg)](https://turbo.build/)
[![Vitest](https://img.shields.io/badge/Vitest-v3-yellow.svg)](https://vitest.dev/)

TypeScript monorepo of connectors that link external platforms (e-commerce, CMS, payments, productivity tools, MCP and agent tooling) to the [FatturaFacile](https://github.com/FatturaFacile/FatturaFacile) ERP API.

> **Status: early stage.** A shared framework and about ten connectors have working code and tests. The other connectors are minimal scaffolds (a bare connector class, about 20 lines) that fix the package name and folder layout. Nothing here is a finished, certified integration yet.

## Overview

- **`@fatturafacile/openapi-sdk`** (`packages/openapi-sdk`): typed client and models for the ERP API. Connectors talk to the ERP only through it.
- **`@fatturafacile/framework`** (`packages/framework`): `BaseConnector`, lifecycle, configuration, events, cache, health checks, resilience (rate limiting, circuit breaker), webhook verification and a marketplace/manifest engine.
- **`@fatturafacile/shared`** (`packages/shared`): client factory, logger, OpenTelemetry helpers, crypto (AES-256-GCM secret manager), queue and test utilities.
- Each connector follows the same layering: `domain/`, `application/`, `infrastructure/`, plus a `manifest.json` that follows `packages/framework/manifest.schema.json`.
- Every ERP call is scoped by tenant.

### Connector status

| Category     | With working code                              | Scaffold only                               |
| :----------- | :--------------------------------------------- | :------------------------------------------ |
| E-commerce   | `woocommerce`, `shopify`                       | `magento`, `prestashop`                     |
| CMS          | `wordpress`                                    |                                             |
| Payments     | `stripe`, `paypal`                             | `twint`, `postfinance`                      |
| Productivity | `microsoft365`, `teams`                        | `google-workspace`, `slack`                 |
| Agents / MCP | three MCP and agent connectors (`packages/ai`) |                                             |
| Developer    | `postman` (collection generator)               |                                             |
| Marketplaces |                                                | `amazon`, `ebay`                            |
| Shipping     |                                                | `dhl`, `gls`, `ups`, `brt`, `swisspost`     |
| CRM          |                                                | `hubspot`, `salesforce`                     |
| Accounting   |                                                | `open-banking`, `peppol`, `bexio`, `abacus` |
| Identity     |                                                | `keycloak`                                  |

Package names follow `@fatturafacile/integration-<name>`.

## Requirements

- Node.js 20 or later (22 recommended)
- pnpm 12 (pinned in `packageManager`; `engines` requires pnpm 9 or later). Use pnpm only.

## Getting started

```bash
git clone https://github.com/FatturaFacile/integrations.git
cd integrations
pnpm install --frozen-lockfile
pnpm run build        # build all packages with Turborepo

# Create a new connector package
pnpm run scaffold <category> <name> "<description>" <tier>
```

The `Dockerfile` and `docker-compose.yml` expect an `apps/playground` application and WireMock files that are not in the repository yet, so they do not build today.

## Configuration

The repository itself needs no configuration. Connectors receive their settings (platform credentials, webhook secrets) at runtime through the framework configuration and the secret manager; no environment file is required. The compose file references `NODE_ENV`, `PORT` and `REDIS_URL` for the planned playground.

## Testing and linting

```bash
pnpm run test           # unit tests in all packages (Vitest)
pnpm run test:coverage  # with V8 coverage
pnpm run typecheck      # tsc in all packages
pnpm run lint           # ESLint in all packages
pnpm run format:check   # Prettier
```

## CI/CD and branching

- `dev` is the default branch. Open pull requests against `dev`. Production is released from `main` with a GitHub release.
- `CI` (`ci.yml`) runs on pull requests and pushes to `main`: typecheck, lint, build, tests with coverage and a dependency audit.
- `Deploy dev` (`deploy-dev.yml`) runs the CI on every push to `dev`.
- `Release Assets` (`deploy.yml`) runs the CI when a GitHub release is published, builds every package and attaches an archive with SHA-256 checksums to the release.

## Project structure

```text
packages/
├── openapi-sdk/    # typed API client
├── framework/      # connector runtime
├── shared/         # logger, telemetry, crypto, queue, test utilities
└── <category>/<connector>/   # ecommerce, cms, payments, shipping, crm, accounting,
                              # identity, productivity, marketplaces, ai, developer
tools/              # shared tsconfig, ESLint and Vitest configuration
scripts/            # scaffold and generator scripts
docs/               # architecture overview, ADRs, development, security and marketplace guides
```

## Related repositories

| Repository                                                        | Relation                                                                                                                              |
| :---------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| [`web-api`](https://github.com/FatturaFacile/web-api)             | The ERP API the connectors call                                                                                                       |
| [`openapi-sdk`](https://github.com/FatturaFacile/openapi-sdk)     | Standalone OpenAPI specification and multi-language SDKs; `packages/openapi-sdk` here is the TypeScript client used by the connectors |
| [`mcp-server`](https://github.com/FatturaFacile/mcp-server)       | Standalone MCP server for the ERP API                                                                                                 |
| [`FatturaFacile`](https://github.com/FatturaFacile/FatturaFacile) | Organization overview and repository map                                                                                              |

## Documentation

- [Development guide](docs/guides/development-guide.md), [security guide](docs/guides/security-guide.md), [marketplace guide](docs/guides/marketplace-guide.md), [architecture overview](docs/architecture/overview.md) and [ADRs](docs/architecture/adr)
- Project wiki: [FatturaFacile/FatturaFacile wiki](https://github.com/FatturaFacile/FatturaFacile/wiki)

## License

[MIT](LICENSE)
