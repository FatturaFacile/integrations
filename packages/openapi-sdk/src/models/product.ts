import { CurrencyCode } from './common.js';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string | undefined;
  priceNet: number;
  priceGross: number;
  vatRatePercentage: number;
  currency: CurrencyCode;
  stockQuantity: number;
  isService: boolean;
  active: boolean;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string | undefined;
  priceNet: number;
  vatRatePercentage: number;
  currency?: CurrencyCode | undefined;
  stockQuantity?: number | undefined;
  isService?: boolean | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface UpdateInventoryRequest {
  quantityChange: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'return';
  referenceId?: string | undefined;
}
