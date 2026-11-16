# Security & Sandboxing Architecture

## 1. Zero Plaintext Secrets
- Secrets must never be committed to Git or stored in plaintext in databases.
- `SecretManager` (`@fatturafacile/framework`) encrypts all secrets with AES-256-GCM.
- Each tenant's secrets are partitioned by key prefix `tenant:${tenantId}:secret:${name}`.

## 2. Webhook Signatures & Anti-Replay
All webhook endpoints implement cryptographically secure verification:
- **Shopify**: Base64 HMAC-SHA256 (`x-shopify-hmac-sha256`)
- **WooCommerce**: Base64 HMAC-SHA256 (`x-wc-webhook-signature`)
- **Stripe**: Timestamped HMAC-SHA256 (`stripe-signature`) with 300s tolerance
- **Generic**: Hex HMAC-SHA256 (`x-hub-signature-256`)

All comparisons use `crypto.timingSafeEqual` via `secureCompare()` to defeat timing attacks.

## 3. Sandboxing & Sanitization
- User input and external platform payloads are sanitized before mapping to ERP parameters.
- Outgoing API requests strictly enforce rate limits and circuit breaker thresholds.
