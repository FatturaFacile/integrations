import { describe, it, expect, vi } from 'vitest';
import { CursorConnector } from '../src/index.js';
import { createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('Cursor IDE MCP Connector', () => {
  it('should initialize and report healthy status', async () => {
    const connector = new CursorConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-cursor-dev',
      config: { debugMode: true },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.details?.['debugMode']).toBe(true);
  });

  it('should query ERP schema via cursor_query_erp_schema', async () => {
    const connector = new CursorConnector();
    await connector.initialize({
      tenantId: 'tenant-cursor-dev',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const res = await connector.getMcpService().executeTool({
      name: 'cursor_query_erp_schema',
      arguments: { entity: 'invoice' }
    });

    expect(res.error).toBeUndefined();
    expect((res.output as any).fields).toContain('invoiceNumber');
    expect((res.output as any).fields).toContain('totalGross');
  });

  it('should test invoice creation via cursor_test_invoice_creation', async () => {
    const connector = new CursorConnector();
    await connector.initialize({
      tenantId: 'tenant-cursor-dev',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(
      createMockInvoice({
        id: 'inv_cursor_1',
        invoiceNumber: 'INV-2026-CURS',
        totalGross: 122
      })
    );

    const res = await connector.getMcpService().executeTool({
      name: 'cursor_test_invoice_creation',
      arguments: {
        customerId: 'cust_cursor_1',
        description: 'Test cursor invoice',
        amount: 100
      }
    });

    expect(res.error).toBeUndefined();
    expect((res.output as any).invoiceNumber).toBe('INV-2026-CURS');
  });
});
