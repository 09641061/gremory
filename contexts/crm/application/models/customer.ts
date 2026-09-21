export type CustomerDocumentType = "DNI" | "RUC" | "FOREIGN_RESIDENT_CARD" | "PASSPORT";

/** Remote CRM projections exposed to application and interface layers. */
export interface CustomerViewModel {
  id: string; organizationId: string; establishmentId: string;
  documentType: CustomerDocumentType; documentNumber: string; name: string;
  phoneCountryCode?: string | null; phoneNumber?: string | null; phone?: string | null;
  email: string; taxpayerStatus?: string | null; taxpayerCondition?: string | null;
}
export interface ResolvedIdentityViewModel {
  documentNumber: string; name: string; taxpayerStatus: string; taxpayerCondition: string;
}
export interface CustomerPageViewModel {
  content: CustomerViewModel[]; page: number; size: number; totalElements: number; totalPages: number;
}
export type CustomerResponse = CustomerViewModel;
export type ResolvedCustomerData = ResolvedIdentityViewModel;
