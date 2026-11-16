# Plugin Marketplace & Manifest Specification

Every integration package must provide a valid `manifest.json` at its root, conforming to `packages/framework/manifest.schema.json`.

## Manifest Fields
- `name`: Package name conforming to `@fatturafacile/integration-[a-z0-9-]+`
- `description`: String description (max 280 chars)
- `version`: Valid SemVer string
- `author`: Team / Author
- `license`: MIT or Apache-2.0
- `category`: One of the 12 primary domains (`ecommerce`, `cms`, `marketplaces`, `payments`, `shipping`, `crm`, `accounting`, `identity`, `productivity`, `communication`, `ai`, `developer`)
- `tier`: 1 (Production Ready), 2 (Enterprise Standard), 3 (Extended Ecosystem)
- `dependencies`: Workspace and external runtime dependencies
- `permissions`: Scopes required on FatturaFacile ERP (`invoices:read`, `invoices:write`, `customers:read`, etc.)
- `supportedErpVersion`: Target FatturaFacile ERP version range
- `supportedPlatforms`: Target environments (e.g. `["node>=20"]`)
- `mcp`: Optional MCP capability declaration (tools and resources exposed)
