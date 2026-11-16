import { CurrencyCode } from './common.js';
import { Customer } from './customer.js';

export type InvoiceType = 'standard' | 'simplified' | 'proforma' | 'receipt';
export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled' | 'sdi_sent' | 'sdi_accepted' | 'sdi_rejected';

export interface InvoiceLineItem {
  id?: string | undefined;
  productId?: string | undefined;
  sku?: string | undefined;
  description: string;
  quantity: number;
  unitPriceNet: number;
  vatRatePercentage: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  currency: CurrencyCode;
  customerId: string;
  customer?: Customer | undefined;
  items: InvoiceLineItem[];
  subtotalNet: number;
  totalVat: number;
  totalGross: number;
  sdiIdentifier?: string | undefined;
  notes?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceRequest {
  type?: InvoiceType | undefined;
  issueDate?: string | undefined;
  dueDate: string;
  currency?: CurrencyCode | undefined;
  customerId: string;
  items: Array<{
    productId?: string | undefined;
    sku?: string | undefined;
    description: string;
    quantity: number;
    unitPriceNet: number;
    vatRatePercentage: number;
  }>;
  notes?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}
