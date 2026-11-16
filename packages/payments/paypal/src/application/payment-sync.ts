import { CurrencyCode, FatturaFacileClient, Payment } from '@fatturafacile/openapi-sdk';
import { Logger } from '@fatturafacile/shared';
import { PayPalCapture } from '../domain/types.js';

export class PayPalPaymentSyncService {
  constructor(
    private readonly erpClient: FatturaFacileClient,
    private readonly logger: Logger
  ) {}

  public async handleCaptureCompleted(capture: PayPalCapture): Promise<Payment> {
    this.logger.info(`Processing PayPal Capture completed: ${capture.id}`);

    const invoiceId = capture.custom_id;
    const amountFloat = parseFloat(capture.amount.value);

    const payment = await this.erpClient.payments.register({
      invoiceId,
      amount: amountFloat,
      currency: (capture.amount.currency_code.toUpperCase() as CurrencyCode) || 'EUR',
      paymentMethod: 'paypal',
      externalTransactionId: capture.id,
      paidAt: capture.create_time,
      metadata: {
        source: 'paypal',
        captureId: capture.id
      }
    });

    if (invoiceId) {
      await this.erpClient.invoices.updateStatus(invoiceId, 'paid');
      this.logger.info(`Updated ERP invoice ${invoiceId} status to 'paid'`);
    }

    return payment;
  }
}
