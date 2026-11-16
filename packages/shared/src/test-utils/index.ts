import {
  Customer,
  Invoice,
  Product,
  Payment,
  CreditNote,
  InvoiceLineItem
} from '@fatturafacile/openapi-sdk';

export function createMockCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: `cust_${Math.random().toString(36).substring(2, 9)}`,
    type: 'company',
    businessName: 'Acme Test S.r.l.',
    vatNumber: 'IT12345678901',
    fiscalCode: '12345678901',
    sdiRecipientCode: 'M5UXCR1',
    email: 'billing@acme-test.example.com',
    phone: '+39021234567',
    address: {
      street: 'Via Roma',
      number: '10',
      city: 'Milano',
      province: 'MI',
      postalCode: '20121',
      country: 'IT'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockInvoiceItem(overrides: Partial<InvoiceLineItem> = {}): InvoiceLineItem {
  const quantity = overrides.quantity ?? 1;
  const unitPriceNet = overrides.unitPriceNet ?? 100;
  const vatRatePercentage = overrides.vatRatePercentage ?? 22;
  const totalNet = quantity * unitPriceNet;
  const totalVat = (totalNet * vatRatePercentage) / 100;
  const totalGross = totalNet + totalVat;

  return {
    description: 'Sample consulting service',
    quantity,
    unitPriceNet,
    vatRatePercentage,
    totalNet,
    totalVat,
    totalGross,
    ...overrides
  };
}

export function createMockInvoice(overrides: Partial<Invoice> = {}): Invoice {
  const items = overrides.items ?? [createMockInvoiceItem()];
  const subtotalNet = items.reduce((acc, i) => acc + i.totalNet, 0);
  const totalVat = items.reduce((acc, i) => acc + i.totalVat, 0);
  const totalGross = subtotalNet + totalVat;

  return {
    id: `inv_${Math.random().toString(36).substring(2, 9)}`,
    invoiceNumber: 'INV-2026-0001',
    type: 'standard',
    status: 'issued',
    issueDate: new Date().toISOString().substring(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
    currency: 'EUR',
    customerId: 'cust_sample_123',
    items,
    subtotalNet,
    totalVat,
    totalGross,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockProduct(overrides: Partial<Product> = {}): Product {
  const priceNet = overrides.priceNet ?? 50;
  const vatRatePercentage = overrides.vatRatePercentage ?? 22;
  const priceGross = priceNet * (1 + vatRatePercentage / 100);

  return {
    id: `prod_${Math.random().toString(36).substring(2, 9)}`,
    sku: 'SKU-SAMPLE-01',
    name: 'Sample Physical Product',
    priceNet,
    priceGross,
    vatRatePercentage,
    currency: 'EUR',
    stockQuantity: 100,
    isService: false,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockPayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: `pay_${Math.random().toString(36).substring(2, 9)}`,
    invoiceId: 'inv_sample_123',
    amount: 122.0,
    currency: 'EUR',
    paymentMethod: 'stripe',
    status: 'completed',
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides
  };
}

export function createMockCreditNote(overrides: Partial<CreditNote> = {}): CreditNote {
  const items = overrides.items ?? [createMockInvoiceItem({ description: 'Refund consulting' })];
  const totalNet = items.reduce((acc, i) => acc + i.totalNet, 0);
  const totalVat = items.reduce((acc, i) => acc + i.totalVat, 0);
  const totalGross = totalNet + totalVat;

  return {
    id: `cn_${Math.random().toString(36).substring(2, 9)}`,
    creditNoteNumber: 'CN-2026-0001',
    originalInvoiceId: 'inv_sample_123',
    issueDate: new Date().toISOString().substring(0, 10),
    currency: 'EUR',
    customerId: 'cust_sample_123',
    items,
    totalNet,
    totalVat,
    totalGross,
    reason: 'Customer return / service dispute resolved',
    createdAt: new Date().toISOString(),
    ...overrides
  };
}
