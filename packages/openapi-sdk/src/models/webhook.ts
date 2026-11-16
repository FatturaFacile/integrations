export type WebhookEventType =
  | 'invoice.created'
  | 'invoice.issued'
  | 'invoice.paid'
  | 'invoice.cancelled'
  | 'customer.created'
  | 'customer.updated'
  | 'product.inventory_low'
  | 'payment.registered';

export interface WebhookSubscription {
  id: string;
  url: string;
  events: WebhookEventType[];
  secret: string;
  active: boolean;
  createdAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  events: WebhookEventType[];
  secret?: string;
}

export interface WebhookEventPayload<T = Record<string, unknown>> {
  id: string;
  event: WebhookEventType;
  tenantId: string;
  timestamp: string;
  data: T;
}
