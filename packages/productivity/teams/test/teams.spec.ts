import { describe, it, expect, vi } from 'vitest';
import { TeamsConnector } from '../src/index.js';
import { createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('Microsoft Teams Connector', () => {
  it('should initialize and report healthy status', async () => {
    const connector = new TeamsConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-teams-1',
      config: { webhookUrl: 'https://outlook.office.com/webhook/test' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should send Adaptive Card notification to Teams channel on invoice issue', async () => {
    const connector = new TeamsConnector();
    await connector.initialize({
      tenantId: 'tenant-teams-1',
      config: { webhookUrl: 'https://outlook.office.com/webhook/test' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'get').mockResolvedValue(
      createMockInvoice({
        id: 'inv_teams_01',
        invoiceNumber: 'INV-2026-TEAMS',
        totalGross: 300,
        currency: 'EUR',
        status: 'issued'
      })
    );

    const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    globalThis.fetch = mockFetch;

    const success = await connector.getNotificationService().notifyInvoiceIssued('inv_teams_01');

    expect(success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledInit] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://outlook.office.com/webhook/test');
    expect(calledInit.body).toContain('INV-2026-TEAMS');
    expect(calledInit.body).toContain('AdaptiveCard');
  });
});
