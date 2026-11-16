import { CurrencyCode } from './common.js';
import { InvoiceLineItem } from './invoice.js';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceId: string;
  issueDate: string;
  currency: CurrencyCode;
  customerId: string;
  items: InvoiceLineItem[];
  totalNet: number;
  totalVat: number;
  totalGross: number;
  reason: string;
  createdAt: string;
}

export interface CreateCreditNoteRequest {
  originalInvoiceId: string;
  issueDate?: string;
  reason: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPriceNet: number;
    vatRatePercentage: number;
  }>;
}
