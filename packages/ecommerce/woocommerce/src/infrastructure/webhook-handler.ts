import { WebhookManager } from '@fatturafacile/framework';
import { Logger } from '@fatturafacile/shared';
import { WooCommerceOrderSyncService } from '../application/order-sync.js';
import { WooCommerceOrder } from '../domain/types.js';

export class WooCommerceWebhookHandler {
  constructor(
    private readonly webhookManager: WebhookManager,
    private readonly syncService: WooCommerceOrderSyncService,
    private readonly logger: Logger
  ) {}

  public async handleWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    webhookSecret: string
  ): Promise<{ status: 'processed' | 'ignored'; invoiceId?: string }> {
    const verification = this.webhookManager.verify('woocommerce', {
      rawBody,
      headers,
      secret: webhookSecret
    });

    if (!verification.valid) {
      this.logger.error(`WooCommerce webhook verification failed: ${verification.error}`);
      throw new Error(`Unauthorized webhook: ${verification.error}`);
    }

    const topic = (headers['x-wc-webhook-topic'] || headers['X-WC-Webhook-Topic']) as string | undefined;
    this.logger.info(`Received WooCommerce webhook topic: ${topic}`);

    if (topic === 'order.created' || topic === 'order.updated') {
      const order = JSON.parse(rawBody) as WooCommerceOrder;
      const invoice = await this.syncService.syncOrder(order);
      return { status: 'processed', invoiceId: invoice.id };
    }

    return { status: 'ignored' };
  }
}
