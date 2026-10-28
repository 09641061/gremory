export type CustomerDocumentType = "DNI" | "RUC" | "FOREIGN_RESIDENT_CARD" | "PASSPORT";

/** Remote CRM projections exposed to application and interface layers. */
export interface CustomerViewModel {
  id: string;
  organizationId: string;
  establishmentId: string;
  documentType: CustomerDocumentType;
  documentNumber: string;
  name: string;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface CustomerPageViewModel {
  content: CustomerViewModel[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CustomerResponse = CustomerViewModel;

export interface CustomerAppointmentItem {
  id: string;
  serviceName: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
  status: string;
}

export interface CustomerAppointmentSummary {
  totalAppointments: number;
  completedAppointments: number;
  noShowCount: number;
  lastOrNextVisitAt?: string | null;
  recentAppointments: CustomerAppointmentItem[];
}

export interface CustomerOverviewViewModel {
  customer: CustomerViewModel;
  appointments: CustomerAppointmentSummary;
  whatsappConversationId?: string | null;
}
