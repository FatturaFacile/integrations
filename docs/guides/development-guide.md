# Developer Quickstart Guide

## Prerequisites
- Node.js LTS (>= 20.0.0, recommended v22)
- pnpm (>= 9.0.0)

## Quickstart Commands
```bash
# 1. Install dependencies across all workspace packages
pnpm install

# 2. Build the entire monorepo
pnpm run build

# 3. Run all unit and contract tests
pnpm run test

# 4. Run tests with coverage
pnpm run test:coverage

# 5. Typecheck all packages
pnpm run typecheck

# 6. Scaffold a new integration package
pnpm run scaffold <category> <name> "<description>" <tier>
# Example:
pnpm run scaffold ecommerce medusajs "Medusa.js headless commerce connector" 2
```

## Adding a New Connector
1. Run the scaffolding CLI: `pnpm run scaffold <category> <name> ...`
2. Implement your domain mappings in `src/domain/`.
3. Implement use cases in `src/application/`.
4. Implement external API calls and webhook verifiers in `src/infrastructure/`.
5. Write contract tests in `test/<name>.spec.ts` using `@fatturafacile/shared/test-utils`.
