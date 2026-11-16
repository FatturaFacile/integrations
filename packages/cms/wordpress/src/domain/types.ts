export interface WordPressUser {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  meta?: Record<string, unknown>;
}

export interface WordPressConfig {
  siteUrl: string;
  applicationUsername?: string;
  applicationPassword?: string;
  portalEnabled?: boolean;
}

export interface CustomerInvoiceSummary {
  invoiceId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  amountGross: number;
  currency: string;
  downloadUrl: string;
}
