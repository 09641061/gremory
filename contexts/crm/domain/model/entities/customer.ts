export type CustomerDocumentType = 'DNI' | 'RUC' | 'FOREIGN_RESIDENT_CARD' | 'PASSPORT';

export interface CustomerResponse {
  id: string;
  organizationId: string;
  establishmentId: string;
  documentType?: CustomerDocumentType | null;
  documentNumber?: string | null;
  name: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  /** Legacy combined value returned for records created before the phone split. */
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}
