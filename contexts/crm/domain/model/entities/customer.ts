export type CustomerDocumentType = 'DNI' | 'RUC' | 'FOREIGN_RESIDENT_CARD' | 'PASSPORT';

export interface ResolvedCustomerData {
  documentNumber: string;
  name: string;
  taxpayerStatus: string;
  taxpayerCondition: string;
}

export interface CustomerResponse {
  id: string;
  organizationId: string;
  establishmentId: string;
  documentType: CustomerDocumentType;
  documentNumber: string;
  name: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  /** Legacy combined value returned for records created before the phone split. */
  phone?: string | null;
  email: string;
  taxpayerStatus?: string | null;
  taxpayerCondition?: string | null;
}
