import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { CopilotConfig } from './domain/types.js';
import { CopilotToolDispatcher } from './application/copilot-plugin.js';
import { generateCopilotDeclarativeManifest } from './infrastructure/copilot-manifest.js';

export * from './domain/types.js';
export * from './application/copilot-plugin.js';
export * from './infrastructure/copilot-manifest.js';

export class CopilotConnector extends BaseConnector {
  public readonly id = 'copilot';
  public readonly name = 'Microsoft 365 Copilot Agent Connector';
  public readonly version = '1.0.0';

  private config!: CopilotConfig;
  private dispatcher!: CopilotToolDispatcher;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.config = {
      agentName: (context.config['agentName'] as string) || 'FatturaFacile ERP Agent',
      enableInvoiceCreation: (context.config['enableInvoiceCreation'] as boolean) ?? true
    };

    const erp = this.getErp();
    this.dispatcher = new CopilotToolDispatcher(erp, this.logger);

    return { success: true };
  }

  public getDispatcher(): CopilotToolDispatcher {
    return this.dispatcher;
  }

  public getDeclarativeManifest(): Record<string, unknown> {
    return generateCopilotDeclarativeManifest();
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        agent: this.config.agentName,
        toolsEnabled: ['customer_lookup', 'invoice_create', 'quote_create', 'reporting'],
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default CopilotConnector;
