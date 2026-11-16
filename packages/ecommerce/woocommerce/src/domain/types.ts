export interface WooCommerceBilling {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string; // ISO 2-letter
  email: string;
  phone?: string;
}

export interface WooCommerceLineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id?: number;
  quantity: number;
  subtotal: string;
  total: string;
  sku?: string;
  price: number;
}

export interface WooCommerceOrder {
  id: number;
  number: string;
  status: 'pending' | 'processing' | 'on-hold' | 'completed' | 'cancelled' | 'refunded' | 'failed';
  currency: string;
  date_created: string;
  total: string;
  total_tax: string;
  billing: WooCommerceBilling;
  line_items: WooCommerceLineItem[];
  payment_method: string;
  payment_method_title: string;
  transaction_id?: string;
  meta_data?: Array<{ key: string; value: string }>;
}

export interface WooCommerceConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
  webhookSecret?: string;
  autoIssueInvoice?: boolean;
  defaultVatPercentage?: number;
}
