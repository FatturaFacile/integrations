import { Address } from './common.js';

export type CustomerType = 'individual' | 'company' | 'public_administration';

export interface Customer {
  id: string;
  type: CustomerType;
  businessName?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  vatNumber?: string | undefined;
  fiscalCode?: string | undefined;
  sdiRecipientCode?: string | undefined;
  pecEmail?: string | undefined;
  email: string;
  phone?: string | undefined;
  address: Address;
  metadata?: Record<string, unknown> | undefined;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  type: CustomerType;
  businessName?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  vatNumber?: string | undefined;
  fiscalCode?: string | undefined;
  sdiRecipientCode?: string | undefined;
  pecEmail?: string | undefined;
  email: string;
  phone?: string | undefined;
  address: Address;
  metadata?: Record<string, unknown> | undefined;
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}
