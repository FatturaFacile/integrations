import {
  Logger,
  createErpClient,
  FatturaFacileClient,
  TenantContext
} from '@fatturafacile/shared';
import {
  ConnectorContext,
  ConnectorResult,
  ConnectorState,
  HealthStatus
} from './types.js';

export abstract class BaseConnector {
  public abstract readonly id: string;
  public abstract readonly name: string;
  public abstract readonly version: string;

  protected state: ConnectorState = 'discovered';
  protected context?: ConnectorContext;
  protected erpClient?: FatturaFacileClient;
  protected readonly logger: Logger;

  constructor(logger?: Logger) {
    this.logger = logger ?? new Logger({ component: this.constructor.name });
  }

  public getState(): ConnectorState {
    return this.state;
  }

  public async initialize(context: ConnectorContext): Promise<ConnectorResult<void>> {
    this.context = context;
    this.state = 'initializing';
    this.logger.info(`Initializing connector [${this.id}] for tenant: ${context.tenantId}`);

    try {
      const tenant: TenantContext = {
        tenantId: context.tenantId,
        organizationId: context.organizationId
      };

      this.erpClient = createErpClient({
        tenant,
        apiKey: context.secrets?.['ERP_API_KEY'],
        bearerToken: context.secrets?.['ERP_BEARER_TOKEN']
      });

      const result = await this.onInitialize(context);
      if (result.success) {
        this.state = 'active';
        this.logger.info(`Connector [${this.id}] is now active`);
      } else {
        this.state = 'error';
        this.logger.error(`Connector [${this.id}] failed initialization: ${result.error?.message}`);
      }
      return result;
    } catch (err) {
      this.state = 'error';
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Connector [${this.id}] threw an unhandled error during initialize: ${msg}`);
      return {
        success: false,
        error: { code: 'INIT_EXCEPTION', message: msg, details: err }
      };
    }
  }

  public async suspend(reason?: string): Promise<void> {
    this.state = 'suspended';
    this.logger.warn(`Connector [${this.id}] suspended. Reason: ${reason ?? 'unspecified'}`);
    await this.onSuspend(reason);
  }

  public async teardown(): Promise<void> {
    this.logger.info(`Tearing down connector [${this.id}]`);
    await this.onTeardown();
    this.state = 'uninstalled';
  }

  public async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try {
      const health = await this.onHealthCheck();
      return {
        ...health,
        latencyMs: Date.now() - start
      };
    } catch (err) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        details: { error: err instanceof Error ? err.message : String(err) }
      };
    }
  }

  // Lifecycle hooks for child classes to implement/override
  public abstract onInitialize(context: ConnectorContext): Promise<ConnectorResult<void>>;

  public async onSuspend(_reason?: string): Promise<void> {
    // default no-op
  }

  public async onTeardown(): Promise<void> {
    // default no-op
  }

  public abstract onHealthCheck(): Promise<HealthStatus>;

  protected getErp(): FatturaFacileClient {
    if (!this.erpClient) {
      throw new Error(`Cannot access ERP client on connector [${this.id}] before initialization`);
    }
    return this.erpClient;
  }
}
