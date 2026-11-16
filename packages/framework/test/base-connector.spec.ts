import { describe, it, expect } from 'vitest';
import { BaseConnector } from '../src/connector/base-connector.js';
import { ConnectorContext, ConnectorResult, HealthStatus } from '../src/connector/types.js';

class TestSampleConnector extends BaseConnector {
  public readonly id = 'test-sample';
  public readonly name = 'Test Sample';
  public readonly version = '1.0.0';

  public async onInitialize(_context: ConnectorContext): Promise<ConnectorResult<void>> {
    return { success: true };
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return { healthy: true, details: { test: true } };
  }
}

describe('Framework BaseConnector', () => {
  it('should transition through state machine upon initialization', async () => {
    const connector = new TestSampleConnector();
    expect(connector.getState()).toBe('discovered');

    const result = await connector.initialize({
      tenantId: 'tenant-123',
      config: {}
    });

    expect(result.success).toBe(true);
    expect(connector.getState()).toBe('active');
  });

  it('should evaluate health check and record latency', async () => {
    const connector = new TestSampleConnector();
    await connector.initialize({ tenantId: 'tenant-123', config: {} });

    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    expect(health.details).toEqual({ test: true });
  });

  it('should support suspend and teardown lifecycle', async () => {
    const connector = new TestSampleConnector();
    await connector.initialize({ tenantId: 'tenant-123', config: {} });

    await connector.suspend('maintenance');
    expect(connector.getState()).toBe('suspended');

    await connector.teardown();
    expect(connector.getState()).toBe('uninstalled');
  });
});
