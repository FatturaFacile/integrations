import {
  FatturaFacileClient,
  Invoice,
  CreateInvoiceRequest,
  Customer,
  CreateCustomerRequest,
  CreditNote,
  CreateCreditNoteRequest
} from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { ShopifyOrder, ShopifyRefund, ShopifyConfig } from '../domain/types.js';

export class ShopifyOrderSyncService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly config: ShopifyConfig,
    private readonly logger: Logger
  ) {}

  public async syncOrder(order: ShopifyOrder): Promise<Invoice> {
    this.logger.info(`Syncing Shopify Order ${order.name} (ID: ${order.id})`);

    const customer = await this.resolveCustomer(order);
    const defaultVat = this.config.defaultVatPercentage ?? 22;

    const items = order.line_items.map((line) => {
      const netUnit = parseFloat(line.price);
      return {
        sku: line.sku || `SHOPIFY-${line.id}`,
        description: line.title,
        quantity: line.quantity,
        unitPriceNet: netUnit,
        vatRatePercentage: line.tax_lines[0]?.rate ? line.tax_lines[0].rate * 100 : defaultVat
      };
    });

    const dueDate = new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10);

    const invoicePayload: CreateInvoiceRequest = {
      type: 'standard',
      issueDate: order.created_at.substring(0, 10),
      dueDate,
      customerId: customer.id,
      items,
      notes: `Shopify Order ${order.name}`,
      metadata: {
        source: 'shopify',
        shopifyOrderId: order.id,
        shopifyOrderName: order.name
      }
    };

    const invoice = await this.erpClient.invoices.create(invoicePayload);
    this.logger.info(`Created ERP Invoice ${invoice.invoiceNumber} for Shopify Order ${order.name}`);

    if (['paid', 'partially_paid'].includes(order.financial_status)) {
      await this.erpClient.payments.register({
        invoiceId: invoice.id,
        amount: parseFloat(order.current_total_price),
        currency: (order.currency.toUpperCase() as any) || 'EUR',
        paymentMethod: 'stripe',
        externalTransactionId: `shopify_${order.id}`,
        paidAt: new Date().toISOString()
      });
      this.logger.info(`Registered payment for ERP Invoice ${invoice.invoiceNumber}`);
    }

    return invoice;
  }

  public async syncRefund(refund: ShopifyRefund, originalInvoiceId: string): Promise<CreditNote> {
    this.logger.info(`Syncing Shopify Refund ${refund.id} for ERP Invoice ${originalInvoiceId}`);
    const defaultVat = this.config.defaultVatPercentage ?? 22;

    const items = refund.refund_line_items.map((rli) => {
      const netUnit = parseFloat(rli.line_item.price);
      return {
        description: `Refund: ${rli.line_item.title}`,
        quantity: rli.quantity,
        unitPriceNet: netUnit,
        vatRatePercentage: defaultVat
      };
    });

    const creditNotePayload: CreateCreditNoteRequest = {
      originalInvoiceId,
      issueDate: refund.created_at.substring(0, 10),
      reason: refund.note || 'Shopify online order return / refund',
      items
    };

    const creditNote = await this.erpClient.creditNotes.create(creditNotePayload);
    this.logger.info(`Created ERP Credit Note ${creditNote.creditNoteNumber}`);
    return creditNote;
  }

  private async resolveCustomer(order: ShopifyOrder): Promise<Customer> {
    const email = order.email || order.customer?.email || 'guest@shopify.com';
    const existing = await this.erpClient.customers.findByVatOrEmail(email);
    if (existing) return existing;

    const billing = order.billing_address;
    const isCompany = Boolean(billing?.company && billing.company.trim().length > 0);

    const customerPayload: CreateCustomerRequest = {
      type: isCompany ? 'company' : 'individual',
      businessName: billing?.company,
      firstName: billing?.first_name || order.customer?.first_name || 'Shopify',
      lastName: billing?.last_name || order.customer?.last_name || 'Customer',
      email,
      phone: billing?.phone,
      address: {
        street: billing?.address1 || 'Online Store Customer',
        number: billing?.address2,
        city: billing?.city || 'Rome',
        province: billing?.province,
        postalCode: billing?.zip || '00100',
        country: billing?.country_code || 'IT'
      },
      metadata: {
        source: 'shopify',
        shopifyCustomerId: order.customer?.id
      }
    };

    return this.erpClient.customers.create(customerPayload);
  }
}
