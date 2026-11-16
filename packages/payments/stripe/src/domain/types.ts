export interface StripePaymentIntent {
  id: string;
  amount: number; // in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'processing' | 'succeeded' | 'canceled';
  customer?: string;
  metadata?: Record<string, string>;
  created: number;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  paid: boolean;
  refunded: boolean;
  payment_intent?: string;
  customer?: string;
  metadata?: Record<string, string>;
}

export interface StripeRefund {
  id: string;
  amount: number; // in cents
  currency: string;
  charge: string;
  payment_intent?: string;
  status: 'succeeded' | 'failed' | 'pending';
  reason?: string;
}

export interface StripeConfig {
  apiKey: string;
  webhookSecret?: string;
  autoReconciliation?: boolean;
}
