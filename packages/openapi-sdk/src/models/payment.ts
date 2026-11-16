import { CurrencyCode } from './common.js';

export type PaymentMethodType =
  | 'bank_transfer'
  | 'credit_card'
  | 'stripe'
  | 'paypal'
  | 'twint'
  | 'postfinance'
  | 'cash'
  | 'direct_debit';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  invoiceId?: string | undefined;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  externalTransactionId?: string | undefined;
  paidAt?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
}

export interface RegisterPaymentRequest {
  invoiceId?: string | undefined;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: PaymentMethodType;
  externalTransactionId?: string | undefined;
  paidAt?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}
