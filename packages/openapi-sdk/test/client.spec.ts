import { describe, it, expect, vi } from 'vitest';
import { FatturaFacileClient } from '../src/index.js';

describe('FatturaFacileClient', () => {
  it('should initialize and attach tenant and authorization headers', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'inv_123',
        invoiceNumber: 'INV-2026-0001',
        status: 'issued',
        totalGross: 122.0
      })
    });

    const client = new FatturaFacileClient({
      baseUrl: 'https://api.fatturafacile.local',
      apiKey: 'test-api-key-xyz',
      tenantId: 'tenant-101',
      organizationId: 'org-202',
      customFetch: mockFetch as unknown as typeof fetch
    });

    const invoice = await client.invoices.get('inv_123');

    expect(invoice.id).toBe('inv_123');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://api.fatturafacile.local/api/v1/erp/invoices/inv_123');
    expect(calledOptions.headers).toMatchObject({
      'X-Tenant-ID': 'tenant-101',
      'X-Organization-ID': 'org-202',
      'X-API-Key': 'test-api-key-xyz'
    });
  });

  it('should create an invoice correctly', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({
        id: 'inv_999',
        invoiceNumber: 'INV-2026-0002',
        status: 'draft',
        totalGross: 244.0
      })
    });

    const client = new FatturaFacileClient({
      baseUrl: 'https://api.fatturafacile.local',
      bearerToken: 'jwt-token-abc',
      tenantId: 'tenant-101',
      customFetch: mockFetch as unknown as typeof fetch
    });

    const invoice = await client.invoices.create({
      dueDate: '2026-12-31',
      customerId: 'cust_001',
      items: [
        {
          description: 'Web development consulting',
          quantity: 2,
          unitPriceNet: 100,
          vatRatePercentage: 22
        }
      ]
    });

    expect(invoice.id).toBe('inv_999');
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://api.fatturafacile.local/api/v1/erp/invoices');
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.headers).toMatchObject({
      'Authorization': 'Bearer jwt-token-abc'
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: async () => 'Invoice not found'
    });

    const client = new FatturaFacileClient({
      baseUrl: 'https://api.fatturafacile.local',
      tenantId: 'tenant-101',
      customFetch: mockFetch as unknown as typeof fetch
    });

    await expect(client.invoices.get('non-existent')).rejects.toThrow(
      'FatturaFacile API error [404] Not Found: Invoice not found'
    );
  });
});
