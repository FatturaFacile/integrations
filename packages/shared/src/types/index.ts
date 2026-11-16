export interface TenantContext {
  tenantId: string;
  organizationId?: string | undefined;
  userId?: string | undefined;
}

export interface TraceContext {
  traceId: string;
  spanId: string;
  sampled?: boolean | undefined;
}

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

export function fail<E = Error>(error: E): Result<never, E> {
  return { success: false, error };
}

export interface DomainEvent<T = Record<string, unknown>> {
  id: string;
  name: string;
  tenantId: string;
  timestamp: string;
  payload: T;
  traceContext?: TraceContext | undefined;
}

export interface IntegrationMappingOptions {
  vatMapping?: Record<string, number> | undefined;
  defaultVatPercentage?: number | undefined;
  paymentMethodMapping?: Record<string, string> | undefined;
  currencyFallback?: string | undefined;
}
