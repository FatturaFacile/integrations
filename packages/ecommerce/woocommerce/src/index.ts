import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus,
  WebhookManager
} from '@fatturafacile/framework';
import { WooCommerceConfig } from './domain/types.js';
import { WooCommerceOrderSyncService } from './application/order-sync.js';
import { WooCommerceWebhookHandler } from './infrastructure/webhook-handler.js';

export * from './domain/types.js';
export * from './application/order-sync.js';
export * from './infrastructure/woocommerce-client.js';
export * from './infrastructure/webhook-handler.js';

export class WooCommerceConnector extends BaseConnector {
  public readonly id = 'woocommerce';
  public readonly name = 'WooCommerce Connector';
  public readonly version = '1.0.0';

  private config!: WooCommerceConfig;
  private syncService!: WooCommerceOrderSyncService;
  private webhookHandler!: WooCommerceWebhookHandler;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      storeUrl: (rawConfig['storeUrl'] as string) || 'https://store.example.com',
      consumerKey: context.secrets?.['WC_CONSUMER_KEY'] || (rawConfig['consumerKey'] as string) || '',
      consumerSecret: context.secrets?.['WC_CONSUMER_SECRET'] || (rawConfig['consumerSecret'] as string) || '',
      webhookSecret: context.secrets?.['WC_WEBHOOK_SECRET'] || (rawConfig['webhookSecret'] as string) || '',
      defaultVatPercentage: (rawConfig['defaultVatPercentage'] as number) || 22
    };

    const erp = this.getErp();
    this.syncService = new WooCommerceOrderSyncService(erp, this.config, this.logger);
    this.webhookHandler = new WooCommerceWebhookHandler(new WebhookManager(), this.syncService, this.logger);

    return { success: true };
  }

  public getSyncService(): WooCommerceOrderSyncService {
    return this.syncService;
  }

  public getWebhookHandler(): WooCommerceWebhookHandler {
    return this.webhookHandler;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    if (!this.config?.storeUrl) {
      return { healthy: false, details: { error: 'Store URL is missing' } };
    }
    return {
      healthy: true,
      details: {
        storeUrl: this.config.storeUrl,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default WooCommerceConnector;
