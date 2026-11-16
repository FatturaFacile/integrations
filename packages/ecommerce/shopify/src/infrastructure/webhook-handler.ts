import { WebhookManager } from '@fatturafacile/framework';
import { Logger } from '@fatturafacile/shared';
import { ShopifyOrderSyncService } from '../application/order-sync.js';
import { ShopifyOrder, ShopifyRefund } from '../domain/types.js';

export class ShopifyWebhookHandler {
  constructor(
    private readonly webhookManager: WebhookManager,
    private readonly syncService: ShopifyOrderSyncService,
    private readonly logger: Logger
  ) {}

  public async handleWebhook(
    rawBody: string,
    headers: Record<string, string | string[] | undefined>,
    webhookSecret: string
  ): Promise<{ status: 'processed' | 'ignored'; entityId?: string }> {
    const verification = this.webhookManager.verify('shopify', {
      rawBody,
      headers,
      secret: webhookSecret
    });

    if (!verification.valid) {
      this.logger.error(`Shopify webhook verification failed: ${verification.error}`);
      throw new Error(`Unauthorized webhook: ${verification.error}`);
    }

    const topic = (headers['x-shopify-topic'] || headers['X-Shopify-Topic']) as string | undefined;
    this.logger.info(`Received Shopify webhook topic: ${topic}`);

    if (topic === 'orders/create' || topic === 'orders/paid') {
      const order = JSON.parse(rawBody) as ShopifyOrder;
      const invoice = await this.syncService.syncOrder(order);
      return { status: 'processed', entityId: invoice.id };
    }

    if (topic === 'refunds/create') {
      const refund = JSON.parse(rawBody) as ShopifyRefund;
      // In production, invoice ID is resolved from Shopify order mapping
      const creditNote = await this.syncService.syncRefund(refund, `inv_shopify_${refund.order_id}`);
      return { status: 'processed', entityId: creditNote.id };
    }

    return { status: 'ignored' };
  }
}
