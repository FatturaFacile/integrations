# ADR 001: OpenAPI Specification as Single Source of Truth

## Context
FatturaFacile ERP exposes a comprehensive RESTful OpenAPI contract. Previously in legacy integrations, developers created duplicated TypeScript interfaces and manual fetch calls, resulting in contract drift, runtime deserialization bugs, and maintenance overhead.

## Decision
All integrations in this monorepo must consume `@fatturafacile/openapi-sdk`. 
- No custom DTOs for invoices, customers, products, payments, or webhooks are permitted.
- Outgoing ERP calls must pass through `createErpClient()` in `@fatturafacile/shared`.
- ESLint and AST rules enforce this restriction at compile time.

## Consequences
- Guaranteed compile-time type safety across all ERP endpoints.
- Automatic propagation of ERP breaking changes to all connector test suites.
- Elimination of contract drift.
