#!/usr/bin/env tsx
import * as fs from 'node:fs';
import * as path from 'node:path';

interface ScaffoldOptions {
  category: string;
  name: string;
  description: string;
  author?: string;
  tier?: number;
}

function scaffoldIntegration(options: ScaffoldOptions): void {
  const { category, name, description, author = 'FatturaFacile Team', tier = 2 } = options;
  const packageDir = path.resolve(process.cwd(), 'packages', category, name);

  if (fs.existsSync(packageDir)) {
    console.error(`Error: Package already exists at ${packageDir}`);
    process.exit(1);
  }

  console.info(`Scaffolding @fatturafacile/integration-${name} in ${packageDir}...`);

  fs.mkdirSync(path.join(packageDir, 'src', 'domain'), { recursive: true });
  fs.mkdirSync(path.join(packageDir, 'src', 'application'), { recursive: true });
  fs.mkdirSync(path.join(packageDir, 'src', 'infrastructure'), { recursive: true });
  fs.mkdirSync(path.join(packageDir, 'test'), { recursive: true });

  const manifest = {
    name: `@fatturafacile/integration-${name}`,
    description,
    version: '1.0.0',
    author,
    license: 'MIT',
    category,
    tier,
    dependencies: {
      '@fatturafacile/framework': 'workspace:*',
      '@fatturafacile/shared': 'workspace:*'
    },
    permissions: [
      'invoices:read',
      'invoices:write',
      'customers:read',
      'customers:write',
      'webhooks:manage'
    ],
    supportedErpVersion: '>=2.0.0',
    supportedPlatforms: ['node>=20']
  };

  fs.writeFileSync(
    path.join(packageDir, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );

  const pkgJson = {
    name: `@fatturafacile/integration-${name}`,
    version: '1.0.0',
    description,
    license: 'MIT',
    author,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    scripts: {
      build: 'tsc',
      test: 'vitest run',
      'test:coverage': 'vitest run --coverage',
      lint: 'eslint src/',
      typecheck: 'tsc --noEmit'
    },
    dependencies: {
      '@fatturafacile/framework': 'workspace:*',
      '@fatturafacile/shared': 'workspace:*'
    },
    devDependencies: {
      '@fatturafacile/tsconfig': 'workspace:*',
      '@fatturafacile/vitest-config': 'workspace:*',
      typescript: '^5.7.3',
      vitest: '^3.0.5'
    }
  };

  fs.writeFileSync(
    path.join(packageDir, 'package.json'),
    JSON.stringify(pkgJson, null, 2) + '\n'
  );

  const tsconfig = {
    extends: '../../../tools/tsconfig/base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', 'test', '**/*.spec.ts', '**/*.test.ts']
  };

  fs.writeFileSync(
    path.join(packageDir, 'tsconfig.json'),
    JSON.stringify(tsconfig, null, 2) + '\n'
  );

  const vitestConfig = `import { defineConfig, mergeConfig } from 'vitest/config';
import { baseVitestConfig } from '../../../tools/vitest/vitest.base';

export default mergeConfig(
  baseVitestConfig,
  defineConfig({
    test: {
      name: '${name}-integration'
    }
  })
);
`;

  fs.writeFileSync(path.join(packageDir, 'vitest.config.ts'), vitestConfig);

  const pascalName = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

  const indexSource = `import { BaseConnector, ConnectorContext, ConnectorResult } from '@fatturafacile/framework';

export class ${pascalName}Connector extends BaseConnector {
  public readonly id = '${name}';
  public readonly name = '${pascalName} Connector';
  public readonly version = '1.0.0';

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.logger.info('${pascalName} connector initialized for tenant ' + context.tenantId);
    return { success: true };
  }

  public async onHealthCheck(): Promise<{ healthy: boolean; details?: Record<string, unknown> }> {
    return { healthy: true, details: { status: 'operational' } };
  }
}

export default ${pascalName}Connector;
`;

  fs.writeFileSync(path.join(packageDir, 'src', 'index.ts'), indexSource);

  const testSource = `import { describe, it, expect } from 'vitest';
import { ${pascalName}Connector } from '../src/index';

describe('${pascalName}Connector', () => {
  it('should initialize successfully', async () => {
    const connector = new ${pascalName}Connector();
    const result = await connector.onInitialize({
      tenantId: 'tenant-test-123',
      organizationId: 'org-test-456',
      config: {}
    });
    expect(result.success).toBe(true);
  });

  it('should report healthy state', async () => {
    const connector = new ${pascalName}Connector();
    const health = await connector.onHealthCheck();
    expect(health.healthy).toBe(true);
  });
});
`;

  fs.writeFileSync(path.join(packageDir, 'test', `${name}.spec.ts`), testSource);

  console.info(`Successfully scaffolded @fatturafacile/integration-${name}`);
}

const args = process.argv.slice(2);
if (args.length >= 3) {
  const [category, name, description, tierStr] = args;
  scaffoldIntegration({
    category: category!,
    name: name!,
    description: description!,
    tier: tierStr ? parseInt(tierStr, 10) : 2
  });
}

export { scaffoldIntegration };
