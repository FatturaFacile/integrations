import { FatturaFacileClient, Payment } from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { StripePaymentIntent, StripeRefund } from '../domain/types.js';

export class StripePaymentSyncService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly logger: Logger
  ) {}

  public async handlePaymentIntentSucceeded(paymentIntent: StripePaymentIntent): Promise<Payment> {
    this.logger.info(`Processing Stripe PaymentIntent succeeded: ${paymentIntent.id}`);

    const invoiceId = paymentIntent.metadata?.['invoiceId'] || paymentIntent.metadata?.['erp_invoice_id'];
    const amountFloat = paymentIntent.amount / 100;

    const payment = await this.erpClient.payments.register({
      invoiceId,
      amount: amountFloat,
      currency: (paymentIntent.currency.toUpperCase() as any) || 'EUR',
      paymentMethod: 'stripe',
      externalTransactionId: paymentIntent.id,
      paidAt: new Date(paymentIntent.created * 1000).toISOString(),
      metadata: {
        source: 'stripe',
        paymentIntentId: paymentIntent.id,
        customerId: paymentIntent.customer
      }
    });

    if (invoiceId) {
      await this.erpClient.invoices.updateStatus(invoiceId, 'paid');
      this.logger.info(`Updated ERP invoice ${invoiceId} status to 'paid'`);
    }

    return payment;
  }

  public async handleRefund(refund: StripeRefund): Promise<void> {
    this.logger.info(`Processing Stripe Refund: ${refund.id} for charge: ${refund.charge}`);
    // Register refund record in ERP metadata / transaction ledger
  }
}
