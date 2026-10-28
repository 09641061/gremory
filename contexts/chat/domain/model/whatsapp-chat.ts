export type WhatsappConversationStatus = "BOT_ACTIVE" | "NEEDS_HUMAN" | "HUMAN_TAKEN";
export type WhatsappMessageDirection = "INBOUND" | "OUTBOUND_BOT" | "OUTBOUND_HUMAN" | "OUTBOUND_BUSINESS_APP";
export type WhatsappDeliveryStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";

export interface ChatCustomerSummary {
  id: string;
  name: string;
  documentType?: string | null;
  documentNumber?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  phoneCountryCode?: string | null;
  email?: string | null;
  notes?: string | null;
}
