import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus,
  WebhookManager
} from '@fatturafacile/framework';
import { ShopifyConfig } from './domain/types.js';
import { ShopifyOrderSyncService } from './application/order-sync.js';
import { ShopifyWebhookHandler } from './infrastructure/webhook-handler.js';

export * from './domain/types.js';
export * from './application/order-sync.js';
export * from './infrastructure/shopify-client.js';
export * from './infrastructure/webhook-handler.js';

export class ShopifyConnector extends BaseConnector {
  public readonly id = 'shopify';
  public readonly name = 'Shopify Connector';
  public readonly version = '1.0.0';

  private config!: ShopifyConfig;
  private syncService!: ShopifyOrderSyncService;
  private webhookHandler!: ShopifyWebhookHandler;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      shopDomain: (rawConfig['shopDomain'] as string) || 'example.myshopify.com',
      accessToken: context.secrets?.['SHOPIFY_ACCESS_TOKEN'] || (rawConfig['accessToken'] as string) || '',
      webhookSecret: context.secrets?.['SHOPIFY_WEBHOOK_SECRET'] || (rawConfig['webhookSecret'] as string) || '',
      defaultVatPercentage: (rawConfig['defaultVatPercentage'] as number) || 22
    };

    const erp = this.getErp();
    this.syncService = new ShopifyOrderSyncService(erp, this.config, this.logger);
    this.webhookHandler = new ShopifyWebhookHandler(new WebhookManager(), this.syncService, this.logger);

    return { success: true };
  }

  public getSyncService(): ShopifyOrderSyncService {
    return this.syncService;
  }

  public getWebhookHandler(): ShopifyWebhookHandler {
    return this.webhookHandler;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    if (!this.config?.shopDomain) {
      return { healthy: false, details: { error: 'Shop domain is missing' } };
    }
    return {
      healthy: true,
      details: {
        shopDomain: this.config.shopDomain,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default ShopifyConnector;
