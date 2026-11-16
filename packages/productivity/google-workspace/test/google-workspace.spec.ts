import { describe, it, expect } from 'vitest';
import { GoogleWorkspaceConnector } from '../src/index';

describe('GoogleWorkspaceConnector', () => {
  it('should initialize successfully', async () => {
    const connector = new GoogleWorkspaceConnector();
    const result = await connector.onInitialize({
      tenantId: 'tenant-test-123',
      organizationId: 'org-test-456',
      config: {}
    });
    expect(result.success).toBe(true);
  });

  it('should report healthy state', async () => {
    const connector = new GoogleWorkspaceConnector();
    const health = await connector.onHealthCheck();
    expect(health.healthy).toBe(true);
  });
});
