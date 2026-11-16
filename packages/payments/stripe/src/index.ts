import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus,
  WebhookManager
} from '@fatturafacile/framework';
import { StripeConfig } from './domain/types.js';
import { StripePaymentSyncService } from './application/payment-sync.js';
import { StripeWebhookHandler } from './infrastructure/webhook-handler.js';

export * from './domain/types.js';
export * from './application/payment-sync.js';
export * from './infrastructure/stripe-client.js';
export * from './infrastructure/webhook-handler.js';

export class StripeConnector extends BaseConnector {
  public readonly id = 'stripe';
  public readonly name = 'Stripe Connector';
  public readonly version = '1.0.0';

  private config!: StripeConfig;
  private syncService!: StripePaymentSyncService;
  private webhookHandler!: StripeWebhookHandler;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      apiKey: context.secrets?.['STRIPE_API_KEY'] || (rawConfig['apiKey'] as string) || '',
      webhookSecret: context.secrets?.['STRIPE_WEBHOOK_SECRET'] || (rawConfig['webhookSecret'] as string) || '',
      autoReconciliation: (rawConfig['autoReconciliation'] as boolean) ?? true
    };

    const erp = this.getErp();
    this.syncService = new StripePaymentSyncService(erp, this.logger);
    this.webhookHandler = new StripeWebhookHandler(new WebhookManager(), this.syncService, this.logger);

    return { success: true };
  }

  public getSyncService(): StripePaymentSyncService {
    return this.syncService;
  }

  public getWebhookHandler(): StripeWebhookHandler {
    return this.webhookHandler;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        autoReconciliation: this.config.autoReconciliation,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default StripeConnector;
