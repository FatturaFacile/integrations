export interface ShopifyAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  zip: string;
  country_code: string; // ISO 2-letter
  phone?: string;
}

export interface ShopifyLineItem {
  id: number;
  variant_id?: number;
  title: string;
  quantity: number;
  sku?: string;
  price: string;
  total_discount: string;
  tax_lines: Array<{
    title: string;
    price: string;
    rate: number;
  }>;
}

export interface ShopifyOrder {
  id: number;
  name: string; // e.g. "#1001"
  email: string;
  created_at: string;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  currency: string;
  current_total_price: string;
  current_total_tax: string;
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  line_items: ShopifyLineItem[];
  customer?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface ShopifyRefund {
  id: number;
  order_id: number;
  created_at: string;
  note?: string;
  refund_line_items: Array<{
    id: number;
    quantity: number;
    line_item: ShopifyLineItem;
    subtotal: string;
    total_tax: string;
  }>;
  transactions: Array<{
    id: number;
    amount: string;
    currency: string;
    kind: string;
    status: string;
  }>;
}

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  webhookSecret?: string;
  defaultVatPercentage?: number;
}
