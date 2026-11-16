export type ConnectorState =
  | 'discovered'
  | 'installed'
  | 'initializing'
  | 'active'
  | 'suspended'
  | 'error'
  | 'uninstalled';

export interface ConnectorContext {
  tenantId: string;
  organizationId?: string | undefined;
  config: Record<string, unknown>;
  secrets?: Record<string, string> | undefined;
}

export interface ConnectorResult<T = unknown> {
  success: boolean;
  data?: T | undefined;
  error?: {
    code: string;
    message: string;
    details?: unknown | undefined;
  } | undefined;
}

export interface HealthStatus {
  healthy: boolean;
  details?: Record<string, unknown> | undefined;
  latencyMs?: number | undefined;
}
