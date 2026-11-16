import {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest
} from './models/customer.js';
import {
  Invoice,
  CreateInvoiceRequest,
  InvoiceStatus
} from './models/invoice.js';
import {
  Product,
  CreateProductRequest,
  UpdateInventoryRequest
} from './models/product.js';
import {
  Payment,
  RegisterPaymentRequest
} from './models/payment.js';
import {
  CreditNote,
  CreateCreditNoteRequest
} from './models/credit-note.js';
import {
  WebhookSubscription,
  CreateWebhookRequest
} from './models/webhook.js';
import { PaginatedResponse } from './models/common.js';

export interface ClientConfig {
  baseUrl: string;
  apiKey?: string | undefined;
  bearerToken?: string | undefined;
  tenantId: string;
  organizationId?: string | undefined;
  timeoutMs?: number | undefined;
  customFetch?: typeof fetch | undefined;
}

export class FatturaFacileClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string | undefined;
  private readonly bearerToken?: string | undefined;
  private readonly tenantId: string;
  private readonly organizationId?: string | undefined;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.bearerToken = config.bearerToken;
    this.tenantId = config.tenantId;
    this.organizationId = config.organizationId;
    this.timeoutMs = config.timeoutMs ?? 15000;
    this.fetchImpl = config.customFetch ?? globalThis.fetch;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant-ID': this.tenantId,
      ...(options.headers as Record<string, string> || {})
    };

    if (this.organizationId) {
      headers['X-Organization-ID'] = this.organizationId;
    }
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        ...options,
        headers,
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`FatturaFacile API error [${response.status}] ${response.statusText}: ${errorBody}`);
      }

      if (response.status === 204) {
        return undefined as unknown as T;
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  public readonly invoices = {
    create: (data: CreateInvoiceRequest): Promise<Invoice> => {
      return this.request<Invoice>('/api/v1/erp/invoices', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    get: (id: string): Promise<Invoice> => {
      return this.request<Invoice>(`/api/v1/erp/invoices/${encodeURIComponent(id)}`);
    },
    list: (params?: { page?: number; perPage?: number; status?: InvoiceStatus }): Promise<PaginatedResponse<Invoice>> => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.perPage) query.set('perPage', String(params.perPage));
      if (params?.status) query.set('status', params.status);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<PaginatedResponse<Invoice>>(`/api/v1/erp/invoices${qs}`);
    },
    updateStatus: (id: string, status: InvoiceStatus): Promise<Invoice> => {
      return this.request<Invoice>(`/api/v1/erp/invoices/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    sendToSdi: (id: string): Promise<{ sdiIdentifier: string; status: 'sent' }> => {
      return this.request<{ sdiIdentifier: string; status: 'sent' }>(
        `/api/v1/erp/invoices/${encodeURIComponent(id)}/sdi-transmit`,
        { method: 'POST' }
      );
    }
  };

  public readonly customers = {
    create: (data: CreateCustomerRequest): Promise<Customer> => {
      return this.request<Customer>('/api/v1/erp/customers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    get: (id: string): Promise<Customer> => {
      return this.request<Customer>(`/api/v1/erp/customers/${encodeURIComponent(id)}`);
    },
    findByVatOrEmail: (identifier: string): Promise<Customer | null> => {
      const query = new URLSearchParams({ search: identifier });
      return this.request<PaginatedResponse<Customer>>(`/api/v1/erp/customers?${query.toString()}`)
        .then((res) => (res.data.length > 0 ? res.data[0]! : null));
    },
    update: (id: string, data: UpdateCustomerRequest): Promise<Customer> => {
      return this.request<Customer>(`/api/v1/erp/customers/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    }
  };

  public readonly products = {
    create: (data: CreateProductRequest): Promise<Product> => {
      return this.request<Product>('/api/v1/erp/products', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    get: (id: string): Promise<Product> => {
      return this.request<Product>(`/api/v1/erp/products/${encodeURIComponent(id)}`);
    },
    getBySku: (sku: string): Promise<Product | null> => {
      const query = new URLSearchParams({ sku });
      return this.request<PaginatedResponse<Product>>(`/api/v1/erp/products?${query.toString()}`)
        .then((res) => (res.data.length > 0 ? res.data[0]! : null));
    },
    updateInventory: (id: string, update: UpdateInventoryRequest): Promise<{ newStock: number }> => {
      return this.request<{ newStock: number }>(`/api/v1/erp/products/${encodeURIComponent(id)}/inventory`, {
        method: 'POST',
        body: JSON.stringify(update)
      });
    }
  };

  public readonly payments = {
    register: (data: RegisterPaymentRequest): Promise<Payment> => {
      return this.request<Payment>('/api/v1/erp/payments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    get: (id: string): Promise<Payment> => {
      return this.request<Payment>(`/api/v1/erp/payments/${encodeURIComponent(id)}`);
    }
  };

  public readonly creditNotes = {
    create: (data: CreateCreditNoteRequest): Promise<CreditNote> => {
      return this.request<CreditNote>('/api/v1/erp/credit-notes', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    get: (id: string): Promise<CreditNote> => {
      return this.request<CreditNote>(`/api/v1/erp/credit-notes/${encodeURIComponent(id)}`);
    }
  };

  public readonly webhooks = {
    subscribe: (data: CreateWebhookRequest): Promise<WebhookSubscription> => {
      return this.request<WebhookSubscription>('/api/v1/erp/webhooks', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    list: (): Promise<WebhookSubscription[]> => {
      return this.request<WebhookSubscription[]>('/api/v1/erp/webhooks');
    },
    delete: (id: string): Promise<void> => {
      return this.request<void>(`/api/v1/erp/webhooks/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
    }
  };
}
