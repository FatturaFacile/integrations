export interface PayPalAmount {
  currency_code: string;
  value: string; // e.g. "120.00"
}

export interface PayPalCapture {
  id: string;
  status: 'COMPLETED' | 'DECLINED' | 'PARTIALLY_REFUNDED' | 'PENDING' | 'REFUNDED';
  amount: PayPalAmount;
  final_capture?: boolean;
  create_time: string;
  custom_id?: string; // Used to pass ERP invoiceId
}

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  mode?: 'sandbox' | 'live';
  webhookId?: string;
}
