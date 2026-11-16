import { describe, it, expect, vi } from 'vitest';
import { PayPalConnector } from '../src/index.js';
import { PayPalCapture } from '../src/domain/types.js';
import { createMockPayment, createMockInvoice } from '@fatturafacile/shared/test-utils';

describe('PayPal Connector', () => {
  const sampleCapture: PayPalCapture = {
    id: 'CAP-123456789',
    status: 'COMPLETED',
    amount: {
      currency_code: 'EUR',
      value: '85.50'
    },
    create_time: '2026-11-16T11:00:00Z',
    custom_id: 'inv_paypal_100'
  };

  it('should initialize and report healthy status', async () => {
    const connector = new PayPalConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-paypal-1',
      config: { mode: 'sandbox' },
      secrets: { ERP_API_KEY: 'test-key', PAYPAL_CLIENT_ID: 'client-id', PAYPAL_CLIENT_SECRET: 'secret' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should process PAYMENT.CAPTURE.COMPLETED and register payment in ERP', async () => {
    const connector = new PayPalConnector();
    await connector.initialize({
      tenantId: 'tenant-paypal-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    const mockPayment = createMockPayment({ id: 'pay_pp_1', amount: 85.5 });
    const mockInvoice = createMockInvoice({ id: 'inv_paypal_100' });

    vi.spyOn(erp.payments, 'register').mockResolvedValue(mockPayment);
    vi.spyOn(erp.invoices, 'updateStatus').mockResolvedValue(mockInvoice);

    const payment = await connector.getSyncService().handleCaptureCompleted(sampleCapture);

    expect(payment.id).toBe('pay_pp_1');
    expect(erp.payments.register).toHaveBeenCalledTimes(1);
    expect(erp.invoices.updateStatus).toHaveBeenCalledWith('inv_paypal_100', 'paid');
  });

  it('should receive and process PayPal webhook event', async () => {
    const connector = new PayPalConnector();
    await connector.initialize({
      tenantId: 'tenant-paypal-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.payments, 'register').mockResolvedValue(createMockPayment({ id: 'pay_wh_pp' }));
    vi.spyOn(erp.invoices, 'updateStatus').mockResolvedValue({} as any);

    const rawBody = JSON.stringify({
      id: 'WH-EVT-1',
      event_type: 'PAYMENT.CAPTURE.COMPLETED',
      resource: sampleCapture
    });

    const res = await connector.getWebhookHandler().handleWebhook(rawBody, {});
    expect(res.status).toBe('processed');
    expect(res.paymentId).toBe('pay_wh_pp');
  });
});
