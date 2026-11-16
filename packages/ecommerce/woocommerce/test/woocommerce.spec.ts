import { describe, it, expect, vi } from 'vitest';
import { WooCommerceConnector } from '../src/index.js';
import { WooCommerceOrder } from '../src/domain/types.js';
import { createMockCustomer, createMockInvoice } from '@fatturafacile/shared/test-utils';
import { computeHmacSha256Base64 } from '@fatturafacile/shared';

describe('WooCommerce Connector', () => {
  const sampleOrder: WooCommerceOrder = {
    id: 501,
    number: '501',
    status: 'completed',
    currency: 'EUR',
    date_created: '2026-11-16T10:00:00',
    total: '122.00',
    total_tax: '22.00',
    billing: {
      first_name: 'Mario',
      last_name: 'Rossi',
      company: 'Rossi Tech Srl',
      address_1: 'Via Garibaldi 12',
      city: 'Torino',
      state: 'TO',
      postcode: '10121',
      country: 'IT',
      email: 'mario.rossi@example.com',
      phone: '+390119876543'
    },
    line_items: [
      {
        id: 1,
        name: 'Wireless Ergonomic Keyboard',
        product_id: 101,
        quantity: 1,
        subtotal: '100.00',
        total: '100.00',
        sku: 'KB-WIRELESS-01',
        price: 100
      }
    ],
    payment_method: 'bacs',
    payment_method_title: 'Direct Bank Transfer',
    transaction_id: 'tx_wc_bank_01'
  };

  it('should initialize successfully and report healthy status', async () => {
    const connector = new WooCommerceConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-woocommerce-1',
      config: {
        storeUrl: 'https://myshop.com',
        defaultVatPercentage: 22
      },
      secrets: {
        ERP_API_KEY: 'test-erp-key'
      }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
    expect(health.details?.['storeUrl']).toBe('https://myshop.com');
  });

  it('should sync an order and call ERP to create customer, invoice, and payment', async () => {
    const connector = new WooCommerceConnector();
    await connector.initialize({
      tenantId: 'tenant-woocommerce-1',
      config: { storeUrl: 'https://myshop.com' },
      secrets: { ERP_API_KEY: 'test-erp-key' }
    });

    const erp = (connector as any).getErp();
    const mockCust = createMockCustomer({ id: 'cust_wc_1', email: 'mario.rossi@example.com' });
    const mockInv = createMockInvoice({ id: 'inv_wc_1', invoiceNumber: 'INV-2026-WC501' });

    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(null);
    vi.spyOn(erp.customers, 'create').mockResolvedValue(mockCust);
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(mockInv);
    vi.spyOn(erp.payments, 'register').mockResolvedValue({} as any);

    const invoice = await connector.getSyncService().syncOrder(sampleOrder);

    expect(invoice.id).toBe('inv_wc_1');
    expect(erp.customers.create).toHaveBeenCalledTimes(1);
    expect(erp.invoices.create).toHaveBeenCalledTimes(1);
    expect(erp.payments.register).toHaveBeenCalledTimes(1);
  });

  it('should verify and process valid incoming WooCommerce webhook', async () => {
    const connector = new WooCommerceConnector();
    const webhookSecret = 'secret-wc-hook';
    await connector.initialize({
      tenantId: 'tenant-woocommerce-1',
      config: { storeUrl: 'https://myshop.com' },
      secrets: { ERP_API_KEY: 'test-erp-key', WC_WEBHOOK_SECRET: webhookSecret }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(createMockCustomer());
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(createMockInvoice({ id: 'inv_hook_wc' }));
    vi.spyOn(erp.payments, 'register').mockResolvedValue({} as any);

    const rawBody = JSON.stringify(sampleOrder);
    const signature = computeHmacSha256Base64(rawBody, webhookSecret);

    const response = await connector.getWebhookHandler().handleWebhook(
      rawBody,
      {
        'x-wc-webhook-topic': 'order.created',
        'x-wc-webhook-signature': signature
      },
      webhookSecret
    );

    expect(response.status).toBe('processed');
    expect(response.invoiceId).toBe('inv_hook_wc');
  });
});
