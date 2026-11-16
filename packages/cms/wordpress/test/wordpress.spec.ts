import { describe, it, expect, vi } from 'vitest';
import { WordPressConnector } from '../src/index.js';
import { createMockCustomer, createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('WordPress Connector', () => {
  it('should initialize and report healthy status', async () => {
    const connector = new WordPressConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-wp-1',
      config: { siteUrl: 'https://mysite.example.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should retrieve customer invoices for portal display', async () => {
    const connector = new WordPressConnector();
    await connector.initialize({
      tenantId: 'tenant-wp-1',
      config: { siteUrl: 'https://mysite.example.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    const customer = createMockCustomer({ id: 'cust_wp_1', email: 'user@mysite.com' });
    const invoice1 = createMockInvoice({ id: 'inv_1', customerId: 'cust_wp_1', invoiceNumber: 'INV-2026-01' });
    const invoice2 = createMockInvoice({ id: 'inv_2', customerId: 'other_cust', invoiceNumber: 'INV-2026-02' });

    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(customer);
    vi.spyOn(erp.invoices, 'list').mockResolvedValue({
      data: [invoice1, invoice2],
      meta: { currentPage: 1, perPage: 50, total: 2, totalPages: 1 }
    });

    const summaries = await connector.getPortalService().getInvoicesForUser('user@mysite.com');

    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.invoiceNumber).toBe('INV-2026-01');
    expect(summaries[0]?.downloadUrl).toContain('/wp-json/fatturafacile/v1/download/inv_1');
  });
});
