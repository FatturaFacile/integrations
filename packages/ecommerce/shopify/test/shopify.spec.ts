import { describe, it, expect, vi } from 'vitest';
import { ShopifyConnector } from '../src/index.js';
import { ShopifyOrder, ShopifyRefund } from '../src/domain/types.js';
import { createMockCustomer, createMockInvoice, createMockCreditNote } from '@fatturafacile/shared/test-utils';
import { computeHmacSha256Base64 } from '@fatturafacile/shared';

describe('Shopify Connector', () => {
  const sampleOrder: ShopifyOrder = {
    id: 1001,
    name: '#1001',
    email: 'claudia.bianchi@example.com',
    created_at: '2026-11-16T10:00:00Z',
    financial_status: 'paid',
    currency: 'EUR',
    current_total_price: '244.00',
    current_total_tax: '44.00',
    billing_address: {
      first_name: 'Claudia',
      last_name: 'Bianchi',
      company: 'Design Studio SRL',
      address1: 'Via Montenapoleone 8',
      city: 'Milano',
      province: 'MI',
      zip: '20121',
      country_code: 'IT',
      phone: '+39023456789'
    },
    line_items: [
      {
        id: 201,
        title: 'Ergonomic Desk Chair',
        quantity: 1,
        sku: 'CHAIR-01',
        price: '200.00',
        total_discount: '0.00',
        tax_lines: [{ title: 'IVA', price: '44.00', rate: 0.22 }]
      }
    ],
    customer: {
      id: 501,
      email: 'claudia.bianchi@example.com',
      first_name: 'Claudia',
      last_name: 'Bianchi'
    }
  };

  const sampleRefund: ShopifyRefund = {
    id: 9001,
    order_id: 1001,
    created_at: '2026-11-16T12:00:00Z',
    note: 'Customer requested cancellation',
    refund_line_items: [
      {
        id: 1,
        quantity: 1,
        line_item: sampleOrder.line_items[0]!,
        subtotal: '200.00',
        total_tax: '44.00'
      }
    ],
    transactions: [
      {
        id: 88,
        amount: '244.00',
        currency: 'EUR',
        kind: 'refund',
        status: 'success'
      }
    ]
  };

  it('should initialize and report healthy status', async () => {
    const connector = new ShopifyConnector();
    const result = await connector.initialize({
      tenantId: 'tenant-shopify-1',
      config: { shopDomain: 'mystore.myshopify.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    expect(result.success).toBe(true);
    const health = await connector.healthCheck();
    expect(health.healthy).toBe(true);
  });

  it('should sync order and create customer, invoice, and payment in ERP', async () => {
    const connector = new ShopifyConnector();
    await connector.initialize({
      tenantId: 'tenant-shopify-1',
      config: { shopDomain: 'mystore.myshopify.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(null);
    vi.spyOn(erp.customers, 'create').mockResolvedValue(createMockCustomer({ id: 'cust_shop_1' }));
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(createMockInvoice({ id: 'inv_shop_1' }));
    vi.spyOn(erp.payments, 'register').mockResolvedValue({} as any);

    const invoice = await connector.getSyncService().syncOrder(sampleOrder);

    expect(invoice.id).toBe('inv_shop_1');
    expect(erp.customers.create).toHaveBeenCalledTimes(1);
    expect(erp.invoices.create).toHaveBeenCalledTimes(1);
    expect(erp.payments.register).toHaveBeenCalledTimes(1);
  });

  it('should sync refund and create Credit Note in ERP', async () => {
    const connector = new ShopifyConnector();
    await connector.initialize({
      tenantId: 'tenant-shopify-1',
      config: { shopDomain: 'mystore.myshopify.com' },
      secrets: { ERP_API_KEY: 'test-key' }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.creditNotes, 'create').mockResolvedValue(createMockCreditNote({ id: 'cn_shop_1' }));

    const creditNote = await connector.getSyncService().syncRefund(sampleRefund, 'inv_shop_1');

    expect(creditNote.id).toBe('cn_shop_1');
    expect(erp.creditNotes.create).toHaveBeenCalledTimes(1);
  });

  it('should verify and handle Shopify orders/create webhook', async () => {
    const connector = new ShopifyConnector();
    const webhookSecret = 'shopify-secret-key';
    await connector.initialize({
      tenantId: 'tenant-shopify-1',
      config: { shopDomain: 'mystore.myshopify.com' },
      secrets: { ERP_API_KEY: 'test-key', SHOPIFY_WEBHOOK_SECRET: webhookSecret }
    });

    const erp = (connector as any).getErp();
    vi.spyOn(erp.customers, 'findByVatOrEmail').mockResolvedValue(createMockCustomer());
    vi.spyOn(erp.invoices, 'create').mockResolvedValue(createMockInvoice({ id: 'inv_wh_shop' }));
    vi.spyOn(erp.payments, 'register').mockResolvedValue({} as any);

    const rawBody = JSON.stringify(sampleOrder);
    const signature = computeHmacSha256Base64(rawBody, webhookSecret);

    const result = await connector.getWebhookHandler().handleWebhook(
      rawBody,
      {
        'x-shopify-topic': 'orders/create',
        'x-shopify-hmac-sha256': signature
      },
      webhookSecret
    );

    expect(result.status).toBe('processed');
    expect(result.entityId).toBe('inv_wh_shop');
  });
});
