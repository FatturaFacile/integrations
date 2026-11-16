# ADR 003: Multi-Tenant Isolation and Cryptographic Key Management

## Context
FatturaFacile ERP is multi-tenant by design. Multiple organizations and legal entities run across shared connector instances. Any leak of credentials, tokens, customer data, or invoices across tenant boundaries constitutes a catastrophic failure.

## Decision
1. All connector instances operate on a stateless or tenant-scoped lifecycle.
2. Credentials and OAuth tokens are encrypted with AES-256-GCM using `SecretManager` with tenant key derivation (`tenant:${tenantId}:secret:${name}`).
3. In-memory and distributed caches enforce tenant key prefixing (`tenant:${tenantId}:*`).
4. All domain events and logs record the immutable `tenantId`.

## Consequences
- Guaranteed cryptographic and memory separation between tenants.
- Safe multitenant execution in both SaaS cloud and on-prem environments.
