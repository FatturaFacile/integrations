import {
  BaseConnector,
  ConnectorContext,
  ConnectorResult,
  HealthStatus
} from '@fatturafacile/framework';
import { ClaudeMcpServer } from './application/claude-mcp-server.js';

export * from './domain/types.js';
export * from './application/claude-mcp-server.js';

export class ClaudeConnector extends BaseConnector {
  public readonly id = 'claude';
  public readonly name = 'Anthropic Claude MCP Connector';
  public readonly version = '1.0.0';

  private mcpServer!: ClaudeMcpServer;

  public async onInitialize(_context: ConnectorContext): Promise<ConnectorResult<void>> {
    const erp = this.getErp();
    this.mcpServer = new ClaudeMcpServer(erp, this.logger);
    return { success: true };
  }

  public getMcpServer(): ClaudeMcpServer {
    return this.mcpServer;
  }

  public async onHealthCheck(): Promise<HealthStatus> {
    return {
      healthy: true,
      details: {
        mcpProtocolVersion: '2024-11-05',
        toolsCount: 4,
        erpConnected: Boolean(this.erpClient)
      }
    };
  }
}

export default ClaudeConnector;
