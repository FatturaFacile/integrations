import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { Microsoft365Config } from './domain/types.js';
import { Microsoft365SyncService } from './application/graph-sync.js';
import { MicrosoftGraphClient } from './infrastructure/graph-client.js';

export * from './domain/types.js';
export * from './application/graph-sync.js';
export * from './infrastructure/graph-client.js';

export class Microsoft365Connector extends BaseConnector {
  public readonly id = 'microsoft365';
  public readonly name = 'Microsoft 365 Connector';
  public readonly version = '1.0.0';

  private config!: Microsoft365Config;
  private syncService!: Microsoft365SyncService;
  private graphClient!: MicrosoftGraphClient;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      tenantId: (rawConfig['tenantId'] as string) || '',
      clientId: (rawConfig['clientId'] as string) || '',
      clientSecret: context.secrets?.['M365_CLIENT_SECRET'] || (rawConfig['clientSecret'] as string) || '',
      userPrincipalName: (rawConfig['userPrincipalName'] as string) || 'billing@company.onmicrosoft.com'
    };

    const erp = this.getErp();
    this.graphClient = new MicrosoftGraphClient(this.config);
    this.syncService = new Microsoft365SyncService(erp, this.graphClient, this.config, this.logger);

    return { success: true };
  }

  public getSyncService(): Microsoft365SyncService {
    return this.syncService;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        configuredSender: this.config.userPrincipalName,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default Microsoft365Connector;
