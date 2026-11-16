import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { TeamsConfig } from './domain/types.js';
import { TeamsNotificationService } from './application/notification-service.js';
import { TeamsWebhookClient } from './infrastructure/teams-webhook-client.js';

export * from './domain/types.js';
export * from './application/notification-service.js';
export * from './infrastructure/teams-webhook-client.js';

export class TeamsConnector extends BaseConnector {
  public readonly id = 'teams';
  public readonly name = 'Microsoft Teams Connector';
  public readonly version = '1.0.0';

  private config!: TeamsConfig;
  private notificationService!: TeamsNotificationService;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      webhookUrl: context.secrets?.['TEAMS_WEBHOOK_URL'] || (rawConfig['webhookUrl'] as string) || '',
      enableAlerts: (rawConfig['enableAlerts'] as boolean) ?? true
    };

    const erp = this.getErp();
    const webhookClient = new TeamsWebhookClient(this.config);
    this.notificationService = new TeamsNotificationService(erp, webhookClient, this.config, this.logger);

    return { success: true };
  }

  public getNotificationService(): TeamsNotificationService {
    return this.notificationService;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        configuredWebhook: Boolean(this.config.webhookUrl),
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default TeamsConnector;
