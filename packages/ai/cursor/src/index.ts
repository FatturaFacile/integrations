import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { CursorConfig } from './domain/types.js';
import { CursorMcpService } from './application/cursor-mcp-server.js';

export * from './domain/types.js';
export * from './application/cursor-mcp-server.js';

export class CursorConnector extends BaseConnector {
  public readonly id = 'cursor';
  public readonly name = 'Cursor IDE MCP Connector';
  public readonly version = '1.0.0';

  private config!: CursorConfig;
  private mcpService!: CursorMcpService;

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.config = {
      debugMode: (context.config['debugMode'] as boolean) ?? false
    };

    const erp = this.getErp();
    this.mcpService = new CursorMcpService(erp, context.tenantId, this.logger);

    return { success: true };
  }

  public getMcpService(): CursorMcpService {
    return this.mcpService;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        debugMode: this.config.debugMode,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default CursorConnector;
