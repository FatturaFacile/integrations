import {
  FatturaFacileClient,
  Invoice,
  CreateInvoiceRequest,
  Customer,
  CreateCustomerRequest
} from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { WooCommerceOrder, WooCommerceConfig } from '../domain/types.js';

export class WooCommerceOrderSyncService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly config: WooCommerceConfig,
    private readonly logger: Logger
  ) {}

  public async syncOrder(order: WooCommerceOrder): Promise<Invoice> {
    this.logger.info(`Starting sync for WooCommerce order #${order.number} (ID: ${order.id})`);

    // 1. Resolve or create customer in ERP
    const customer = await this.resolveCustomer(order);

    // 2. Map line items
    const defaultVat = this.config.defaultVatPercentage ?? 22;
    const items = order.line_items.map((item) => {
      const netUnit = item.quantity > 0 ? parseFloat(item.total) / item.quantity : item.price;
      return {
        sku: item.sku || `WC-${item.product_id}`,
        description: item.name,
        quantity: item.quantity,
        unitPriceNet: Math.round(netUnit * 100) / 100,
        vatRatePercentage: defaultVat
      };
    });

    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

    const invoicePayload: CreateInvoiceRequest = {
      type: 'standard',
      issueDate: order.date_created.substring(0, 10),
      dueDate,
      customerId: customer.id,
      items,
      notes: `Generated from WooCommerce Order #${order.number} (${order.payment_method_title})`,
      metadata: {
        source: 'woocommerce',
        wooCommerceOrderId: order.id,
        wooCommerceOrderNumber: order.number,
        transactionId: order.transaction_id
      }
    };

    const invoice = await this.erpClient.invoices.create(invoicePayload);
    this.logger.info(`Created ERP Invoice ${invoice.invoiceNumber} for WooCommerce order #${order.number}`);

    // If order was already paid, register payment
    if (['processing', 'completed'].includes(order.status)) {
      await this.erpClient.payments.register({
        invoiceId: invoice.id,
        amount: parseFloat(order.total),
        currency: (order.currency.toUpperCase() as any) || 'EUR',
        paymentMethod: 'credit_card',
        externalTransactionId: order.transaction_id || `wc_${order.id}`,
        paidAt: new Date().toISOString()
      });
      this.logger.info(`Registered payment for ERP Invoice ${invoice.invoiceNumber}`);
    }

    return invoice;
  }

  private async resolveCustomer(order: WooCommerceOrder): Promise<Customer> {
    const email = order.billing.email;
    const existing = await this.erpClient.customers.findByVatOrEmail(email);
    if (existing) {
      return existing;
    }

    const isCompany = Boolean(order.billing.company && order.billing.company.trim().length > 0);
    const customerPayload: CreateCustomerRequest = {
      type: isCompany ? 'company' : 'individual',
      businessName: order.billing.company || undefined,
      firstName: order.billing.first_name,
      lastName: order.billing.last_name,
      email,
      phone: order.billing.phone || undefined,
      address: {
        street: order.billing.address_1,
        number: order.billing.address_2,
        city: order.billing.city,
        province: order.billing.state,
        postalCode: order.billing.postcode,
        country: order.billing.country || 'IT'
      },
      metadata: {
        source: 'woocommerce'
      }
    };

    return this.erpClient.customers.create(customerPayload);
  }
}
