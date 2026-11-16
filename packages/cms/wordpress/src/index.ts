import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { WordPressConfig } from './domain/types.js';
import { WordPressPortalService } from './application/portal-service.js';

export * from './domain/types.js';
export * from './application/portal-service.js';
export * from './infrastructure/wp-client.js';

export class WordPressConnector extends BaseConnector {
  public readonly id = 'wordpress';
  public readonly name = 'WordPress Connector';
  public readonly version = '1.0.0';

  private config!: WordPressConfig;
  private portalService!: WordPressPortalService;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    const rawConfig = context.config;
    this.config = {
      siteUrl: (rawConfig['siteUrl'] as string) || 'https://mywordpress.example.com',
      applicationUsername: (rawConfig['applicationUsername'] as string) || '',
      applicationPassword: context.secrets?.['WP_APP_PASSWORD'] || (rawConfig['applicationPassword'] as string) || '',
      portalEnabled: (rawConfig['portalEnabled'] as boolean) ?? true
    };

    const erp = this.getErp();
    this.portalService = new WordPressPortalService(erp, this.config, this.logger);

    return { success: true };
  }

  public getPortalService(): WordPressPortalService {
    return this.portalService;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    if (!this.config?.siteUrl) {
      return { healthy: false, details: { error: 'Site URL missing' } };
    }
    return {
      healthy: true,
      details: {
        siteUrl: this.config.siteUrl,
        portalEnabled: this.config.portalEnabled,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default WordPressConnector;
