# FatturaFacile Integrations Architecture Overview

## Executive Summary
`FatturaFacile/integrations` is the enterprise-grade monorepo containing all connectors, runtime bridges, polyglot plugins, and Model Context Protocol (MCP) servers connecting the external digital ecosystem to the FatturaFacile Open Source ERP.

## Core Architectural Pillars
1. **OpenAPI-First (Single Source of Truth)**:
   - All external connectors communicate with the ERP exclusively using `@fatturafacile/openapi-sdk` (or generated typed OpenAPI clients for PHP / .NET).
   - Direct HTTP fetches or duplicated ERP data models are strictly prohibited.
2. **Framework & Clean Architecture**:
   - Every integration package extends `BaseConnector` from `@fatturafacile/framework`.
   - Clear separation of layers: `domain/` (pure business models), `application/` (use-case orchestration), and `infrastructure/` (external platform API clients & webhooks).
3. **MCP-Native & AI-First**:
   - Connectors for Claude, Cursor, Copilot, and other agent platforms expose native Model Context Protocol tools and resources.
4. **Strict Multi-Tenant Isolation**:
   - All state, secret storage, cache partitions, and event streams are strictly isolated by `tenantId`.
5. **Resilience & Security**:
   - Built-in token-bucket rate limiters, circuit breakers, exponential backoff retries, AES-256-GCM secret envelope encryption, and anti-replay webhook verifiers.
