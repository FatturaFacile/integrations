import { describe, it, expect, vi } from 'vitest';
import { Microsoft365Connector } from '../src/index.js';
import { createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('Microsoft 365 Connector', () => {
  it('should initialize and report healthy status', async () => {
    const connector = new Microsoft365Connector();
    const result = await connector.initialize({
      tenantId: 'tenant-m365-1',
      config: {
        tenantId: 'azure-ad-tenant-1',
        clientId: 'azure-ad-client-1',
        userPrincipalName: 'admin@mycompany.com'
      },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.details?.['configuredSender']).toBe('admin@mycompany.com');
  });

  it('should send invoice email notification via Graph API', async () => {
    const connector = new Microsoft365Connector();
    await connector.initialize({
      tenantId: 'tenant-m365-1',
      config: { userPrincipalName: 'billing@mycompany.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.invoices, 'get').mockResolvedValue(
      createMockInvoice({
        id: 'inv_m365_01',
        invoiceNumber: 'INV-2026-M365',
        totalGross: 500,
        currency: 'EUR',
        dueDate: '2026-12-15'
      })
    );

    const graphClient = (connector as any).graphClient;
    const sendMailSpy = vi.spyOn(graphClient, 'sendMail').mockResolvedValue(undefined);

    const success = await connector.getSyncService().sendInvoiceNotification('inv_m365_01', 'client@clientdomain.com');

    expect(success).toBe(true);
    expect(sendMailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: 'FatturaFacile: Fattura INV-2026-M365',
        toRecipients: ['client@clientdomain.com']
      })
    );
  });
});
