import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { PayPalConfig } from './domain/types.js';
import { PayPalPaymentSyncService } from './application/payment-sync.js';
import { PayPalWebhookHandler } from './infrastructure/webhook-handler.js';

export * from './domain/types.js';
export * from './application/payment-sync.js';
export * from './infrastructure/paypal-client.js';
export * from './infrastructure/webhook-handler.js';

export class PayPalConnector extends BaseConnector {
  public readonly id = 'paypal';
  public readonly name = 'PayPal Connector';
  public readonly version = '1.0.0';

  private config!: PayPalConfig;
  private syncService!: PayPalPaymentSyncService;
  private webhookHandler!: PayPalWebhookHandler;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      clientId: context.secrets?.['PAYPAL_CLIENT_ID'] || (rawConfig['clientId'] as string) || '',
      clientSecret: context.secrets?.['PAYPAL_CLIENT_SECRET'] || (rawConfig['clientSecret'] as string) || '',
      mode: (rawConfig['mode'] as 'sandbox' | 'live') || 'sandbox',
      webhookId: (rawConfig['webhookId'] as string) || ''
    };

    const erp = this.getErp();
    this.syncService = new PayPalPaymentSyncService(erp, this.logger);
    this.webhookHandler = new PayPalWebhookHandler(this.syncService, this.logger);

    return { success: true };
  }

  public getSyncService(): PayPalPaymentSyncService {
    return this.syncService;
  }

  public getWebhookHandler(): PayPalWebhookHandler {
    return this.webhookHandler;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        mode: this.config.mode,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default PayPalConnector;
