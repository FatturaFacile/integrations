import {
  FatturaFacileClient,
  ClientConfig
} from '@fatturafacile/openapi-sdk';
import { TenantContext, TraceContext } from '../types/index.js';
import { formatTraceparent } from '../telemetry/index.js';

export interface ErpClientFactoryOptions {
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  bearerToken?: string | undefined;
  tenant: TenantContext;
  traceContext?: TraceContext | undefined;
  timeoutMs?: number | undefined;
  customFetch?: typeof fetch | undefined;
}

export function createErpClient(options: ErpClientFactoryOptions): FatturaFacileClient {
  const baseUrl = options.baseUrl ?? process.env['FATTURAFACILE_API_BASE_URL'] ?? 'https://api.fatturafacile.it';

  // Custom fetch wrapper that automatically propagates traceparent and telemetry
  const baseFetch = options.customFetch ?? globalThis.fetch;
  const wrappedFetch: typeof fetch = (input, init = {}) => {
    const reqHeaders = (init.headers as Record<string, string>) || {};
    const headers = new Headers(reqHeaders);
    if (options.traceContext && !headers.has('traceparent')) {
      headers.set('traceparent', formatTraceparent(options.traceContext));
    }
    return baseFetch(input, {
      ...init,
      headers
    });
  };

  const clientConfig: ClientConfig = {
    baseUrl,
    apiKey: options.apiKey,
    bearerToken: options.bearerToken,
    tenantId: options.tenant.tenantId,
    organizationId: options.tenant.organizationId,
    timeoutMs: options.timeoutMs ?? 20000,
    customFetch: wrappedFetch
  };

  return new FatturaFacileClient(clientConfig);
}

export * from '@fatturafacile/openapi-sdk';
