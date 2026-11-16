import { WebhookManager } from '@fatturafacile/framework';
import { Logger } from '@fatturafacile/shared';
import { StripePaymentSyncService } from '../application/payment-sync.js';
import { StripePaymentIntent, StripeRefund } from '../domain/types.js';

export class StripeWebhookHandler {
  constructor(
    private readonly webhookManager: WebhookManager,
    private readonly syncService: StripePaymentSyncService,
    private readonly logger: Logger
  ) {}

  public async handleWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    webhookSecret: string
  ): Promise<{ status: 'processed' | 'ignored'; paymentId?: string }> {
    const verification = this.webhookManager.verify('stripe', {
      rawBody,
      headers,
      secret: webhookSecret,
      toleranceSeconds: 300
    });

    if (!verification.valid) {
      this.logger.error(`Stripe webhook verification failed: ${verification.error}`);
      throw new Error(`Unauthorized webhook: ${verification.error}`);
    }

    const event = JSON.parse(rawBody) as { type: string; data: { object: unknown } };
    this.logger.info(`Received Stripe webhook event: ${event.type}`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as StripePaymentIntent;
      const payment = await this.syncService.handlePaymentIntentSucceeded(paymentIntent);
      return { status: 'processed', paymentId: payment.id };
    }

    if (event.type === 'charge.refunded') {
      const refund = event.data.object as StripeRefund;
      await this.syncService.handleRefund(refund);
      return { status: 'processed' };
    }

    return { status: 'ignored' };
  }
}
