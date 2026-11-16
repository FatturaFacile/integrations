import { BaseConnector, ConnectorContext, ConnectorResult } from '@fatturafacile/framework';

export class AbacusConnector extends BaseConnector {
  public readonly id = 'abacus';
  public readonly name = 'Abacus Connector';
  public readonly version = '1.0.0';

  public async onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.logger.info('Abacus connector initialized for tenant ' + context.tenantId);
    return { success: true };
  }

  public async onHealthCheck(): Promise<{ healthy: boolean; details?: Record<string, unknown> }> {
    return { healthy: true, details: { status: 'operational' } };
  }
}

export default AbacusConnector;
