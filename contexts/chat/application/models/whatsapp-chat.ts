import type {
  WhatsappConversationStatus,
  WhatsappMessageDirection,
  WhatsappDeliveryStatus,
  ChatCustomerSummary,
} from "../../domain/model/whatsapp-chat";

export type {
  WhatsappConversationStatus,
  WhatsappMessageDirection,
  WhatsappDeliveryStatus,
  ChatCustomerSummary,
};

export interface WhatsappConversationSummary {
  id: string;
  customerId?: string | null;
  customerName?: string | null;
  contactPhone: string;
  contactDisplayName?: string | null;
  status: WhatsappConversationStatus;
  summaryTag?: string | null;
  unreadCount: number;
  lastMessagePreview?: string | null;
  lastMessageAt: string;
  customerServiceWindowOpen: boolean;
}

export interface WhatsappMessageItem {
  id: string;
  conversationId: string;
  whatsappMessageId?: string | null;
  direction: WhatsappMessageDirection;
  messageType: string;
  content: string;
  deliveryStatus: WhatsappDeliveryStatus;
  sentByUserId?: string | null;
  createdAt: string;
}

export interface WhatsappConversationDetail {
  conversation: WhatsappConversationSummary;
  messages: WhatsappMessageItem[];
  customer?: ChatCustomerSummary | null;
}

export interface WhatsappConversationPageViewModel {
  content: WhatsappConversationSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface WhatsappWsEvent {
  type: "MESSAGE_RECEIVED" | "MESSAGE_SENT" | "MESSAGE_STATUS_UPDATED" | "CONVERSATION_UPDATED";
  payload: unknown;
  timestamp: string;
}
