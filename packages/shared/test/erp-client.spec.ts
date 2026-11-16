import { describe, it, expect, vi } from 'vitest';
import { createErpClient } from '../src/erp-client/index.js';
import { createMockCustomer, createMockInvoice } from '../src/test-utils/index.js';

describe('Shared ERP Client Factory & Test Utils', () => {
  it('should instantiate ERP client and inject traceparent header', async () => {
    const mockCustomer = createMockCustomer({ id: 'cust_abc' });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCustomer
    });

    const client = createErpClient({
      baseUrl: 'https://api.fatturafacile.test',
      apiKey: 'test-key',
      tenant: { tenantId: 'tenant-42', organizationId: 'org-42' },
      traceContext: { traceId: '12345678901234567890123456789012', spanId: '1234567890123456', sampled: true },
      customFetch: mockFetch as unknown as typeof fetch
    });

    const customer = await client.customers.get('cust_abc');
    expect(customer.id).toBe('cust_abc');

    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.fatturafacile.test/api/v1/erp/customers/cust_abc');
    expect((init.headers as Headers).get('traceparent')).toBe('00-12345678901234567890123456789012-1234567890123456-01');
  });

  it('createMockInvoice should produce valid amounts and items', () => {
    const invoice = createMockInvoice({
      items: [
        {
          description: 'Consulting',
          quantity: 2,
          unitPriceNet: 100,
          vatRatePercentage: 22,
          totalNet: 200,
          totalVat: 44,
          totalGross: 244
        }
      ]
    });

    expect(invoice.subtotalNet).toBe(200);
    expect(invoice.totalVat).toBe(44);
    expect(invoice.totalGross).toBe(244);
    expect(invoice.items).toHaveLength(1);
  });
});
