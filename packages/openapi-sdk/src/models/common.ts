export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Address {
  street: string;
  number?: string | undefined;
  city: string;
  province?: string | undefined;
  postalCode: string;
  country: string; // ISO 3166-1 alpha-2 (e.g. "IT", "CH")
}

export type CurrencyCode = 'EUR' | 'CHF' | 'USD' | 'GBP';

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  natureCode?: string | undefined; // e.g. "N1", "N2.1" for Italian SDI / electronic invoicing
}

export interface ErpApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | undefined;
  };
}
