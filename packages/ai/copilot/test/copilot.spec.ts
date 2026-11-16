import { describe, it, expect, vi } from 'vitest';
import { CopilotConnector } from '../src/index.js';
import { createMockCustomer, createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('Microsoft 365 Copilot Connector', () => {
  it('should initialize and provide declarative agent manifest', async () => {
    const connector = new CopilotConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-copilot-1',
      config: { agentName: 'FatturaFacile Assistant' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const manifest = connector.getDeclarativeManifest();
    expect(manifest['name']).toBe('FatturaFacile ERP Agent');
    expect(manifest['capabilities']).toHaveLength(4);
  });

  it('should execute customer_lookup tool call', async () => {
    const connector = new CopilotConnector();
    await connector.initialize({
      tenantId: 'tenant-copilot-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    const mockCustomer = createMockCustomer({ vatNumber: 'IT12345678901' });
    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(mockCustomer);

    const toolResult = await connector.getDispatcher().executeTool({
      name: 'customer_lookup',
      parameters: { identifier: 'IT12345678901' }
    });

    expect(toolResult.error).toBeUndefined();
    expect(toolResult.result['found']).toBe(true);
  });

  it('should execute invoice_create tool call', async () => {
    const connector = new CopilotConnector();
    await connector.initialize({
      tenantId: 'tenant-copilot-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(
      createMockInvoice({
        id: 'inv_copilot_1',
        invoiceNumber: 'INV-2026-CP1',
        totalGross: 610.0
      })
    );

    const toolResult = await connector.getDispatcher().executeTool({
      name: 'invoice_create',
      parameters: {
        customerId: 'cust_abc',
        description: 'Software development sprint 1',
        amount: 500,
        vatRate: 22
      }
    });

    expect(toolResult.error).toBeUndefined();
    expect(toolResult.result['invoiceNumber']).toBe('INV-2026-CP1');
  });

  it('should execute reporting tool call and summarize stats', async () => {
    const connector = new CopilotConnector();
    await connector.initialize({
      tenantId: 'tenant-copilot-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'list').mockResolvedValue({
      data: [
        createMockInvoice({ status: 'paid', totalGross: 100 }),
        createMockInvoice({ status: 'issued', totalGross: 200 })
      ],
      meta: { currentPage: 1, perPage: 50, total: 2, totalPages: 1 }
    });

    const toolResult = await connector.getDispatcher().executeTool({
      name: 'reporting',
      parameters: {}
    });

    expect(toolResult.result['totalInvoices']).toBe(2);
    expect(toolResult.result['totalRevenue']).toBe(300);
    expect(toolResult.result['paidCount']).toBe(1);
    expect(toolResult.result['openCount']).toBe(1);
  });
});
