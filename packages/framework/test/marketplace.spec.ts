import { describe, it, expect } from 'vitest';
import {
  validateManifest,
  IntegrationManifest,
  PluginRegistry,
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '../src/index.js';

class MockPluginConnector extends BaseConnector {
  public readonly id = 'mock-plugin';
  public readonly name = 'Mock Plugin';
  public readonly version = '1.0.0';

  public async onInitialize(_context: ConnectorContext): Promise<ConnectorResult<void>> {
    return { success: true };
  }
  public async onHealthCheck(): Promise<HealthStatus> {
    return { healthy: true };
  }
}

describe('Framework Marketplace & Manifest', () => {
  const validManifest: IntegrationManifest = {
    name: '@fatturafacile/integration-woocommerce',
    description: 'WooCommerce enterprise synchronization for FatturaFacile ERP',
    version: '1.0.0',
    author: 'FatturaFacile Team',
    license: 'MIT',
    category: 'ecommerce',
    tier: 1,
    dependencies: {
      '@fatturafacile/framework': 'workspace:*',
      '@fatturafacile/shared': 'workspace:*'
    },
    permissions: ['invoices:read', 'invoices:write', 'customers:read', 'webhooks:manage'],
    supportedErpVersion: '>=2.0.0',
    supportedPlatforms: ['node>=20']
  };

  it('should validate a compliant manifest.json', () => {
    const result = validateManifest(validManifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject manifest with invalid name or missing required fields', () => {
    const invalid = {
      ...validManifest,
      name: 'invalid-name-format',
      license: 'GPL-3.0'
    };
    const result = validateManifest(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should register plugin, install for tenant, and check permissions in PluginRegistry', () => {
    const registry = new PluginRegistry();
    registry.register(validManifest, () => new MockPluginConnector());

    expect(registry.list()).toHaveLength(1);
    expect(registry.isInstalledForTenant(validManifest.name, 'tenant-alpha')).toBe(false);

    registry.installForTenant(validManifest.name, 'tenant-alpha');
    expect(registry.isInstalledForTenant(validManifest.name, 'tenant-alpha')).toBe(true);

    expect(registry.checkPermission(validManifest.name, 'invoices:write')).toBe(true);
    expect(registry.checkPermission(validManifest.name, 'unauthorized:scope')).toBe(false);

    registry.uninstallForTenant(validManifest.name, 'tenant-alpha');
    expect(registry.isInstalledForTenant(validManifest.name, 'tenant-alpha')).toBe(false);
  });
});
