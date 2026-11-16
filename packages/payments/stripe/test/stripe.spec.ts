import { describe, it, expect, vi } from 'vitest';
import { StripeConnector } from '../src/index.js';
import { StripePaymentIntent } from '../src/domain/types.js';
import { createMockPayment, createMockInvoice } from '@fatturafacile/shared/test-utils';
import { computeHmacSha256 } from '@fatturafacile/shared';

describe('Stripe Connector', () => {
  const samplePI: StripePaymentIntent = {
    id: 'pi_3MtwBwLkdIwHu7ix28a3tqPa',
    amount: 15000, // 150.00 EUR
    currency: 'eur',
    status: 'succeeded',
    customer: 'cus_9999',
    metadata: {
      invoiceId: 'inv_erp_123'
    },
    created: 1700000000
  };

  it('should initialize and report healthy status', async () => {
    const connector = new StripeConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-stripe-1',
      config: { autoReconciliation: true },
      secrets: { ERP_API_KEY: 'test-key', STRIPE_API_KEY: 'sk_test_123' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should process payment_intent.succeeded and register payment & update invoice in ERP', async () => {
    const connector = new StripeConnector();
    await connector.initialize({
      tenantId: 'tenant-stripe-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    const mockPayment = createMockPayment({ id: 'pay_stripe_1', amount: 150 });
    const mockInvoice = createMockInvoice({ id: 'inv_erp_123' });

    vi.spyOn(erp.payments, 'register').mockResolvedValue(mockPayment);
    vi.spyOn(erp.invoices, 'updateStatus').mockResolvedValue(mockInvoice);

    const payment = await connector.getSyncService().handlePaymentIntentSucceeded(samplePI);

    expect(payment.id).toBe('pay_stripe_1');
    expect(erp.payments.register).toHaveBeenCalledTimes(1);
    expect(erp.invoices.updateStatus).toHaveBeenCalledWith('inv_erp_123', 'paid');
  });

  it('should verify and handle signed Stripe webhook', async () => {
    const connector = new StripeConnector();
    const webhookSecret = 'whsec_test_123';
    await connector.initialize({
      tenantId: 'tenant-stripe-1',
      config: {},
      secrets: { ERP_API_KEY: 'test-key', STRIPE_WEBHOOK_SECRET: webhookSecret }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.payments, 'register').mockResolvedValue(createMockPayment({ id: 'pay_wh_1' }));
    vi.spyOn(erp.invoices, 'updateStatus').mockResolvedValue({} as any);

    const eventPayload = {
      id: 'evt_test_1',
      type: 'payment_intent.succeeded',
      data: { object: samplePI }
    };
    const rawBody = JSON.stringify(eventPayload);
    const now = Math.floor(Date.now() / 1000);
    const signature = computeHmacSha256(`${now}.${rawBody}`, webhookSecret);

    const res = await connector.getWebhookHandler().handleWebhook(
      rawBody,
      { 'stripe-signature': `t=${now},v1=${signature}` },
      webhookSecret
    );

    expect(res.status).toBe('processed');
    expect(res.paymentId).toBe('pay_wh_1');
  });
});
