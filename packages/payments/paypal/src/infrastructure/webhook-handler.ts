import { Logger } from '@fatturafacile/shared';
import { PayPalPaymentSyncService } from '../application/payment-sync.js';
import { PayPalCapture } from '../domain/types.js';

export class PayPalWebhookHandler {
  constructor(
    private readonly syncService: PayPalPaymentSyncService,
    private readonly logger: Logger
  ) {}

  public async handleWebhook(
    rawBody: string,
    _headers: Record<string, string | string[] | undefined>
  ): Promise<{ status: 'processed' | 'ignored'; paymentId?: string }> {
    const event = JSON.parse(rawBody) as {
      event_type: string;
      resource: unknown;
    };

    this.logger.info(`Received PayPal webhook event: ${event.event_type}`);

    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = event.resource as PayPalCapture;
      const payment = await this.syncService.handleCaptureCompleted(capture);
      return { status: 'processed', paymentId: payment.id };
    }

    return { status: 'ignored' };
  }
}
