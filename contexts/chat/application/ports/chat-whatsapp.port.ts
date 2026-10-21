import type {
  WhatsappConversationSummary,
  WhatsappConversationDetail,
  WhatsappConversationPageViewModel,
  WhatsappMessageItem,
} from "../models/whatsapp-chat";

export interface ChatWhatsappPort {
  listConversations(
    establishmentId: string,
    filter?: string,
    search?: string,
    page?: number,
    size?: number,
    token?: string,
  ): Promise<WhatsappConversationPageViewModel>;

  getConversation(
    id: string,
    establishmentId: string,
    token?: string,
  ): Promise<WhatsappConversationDetail>;

  takeoverConversation(
    id: string,
    establishmentId: string,
    token?: string,
  ): Promise<WhatsappConversationSummary>;

  releaseConversation(
    id: string,
    establishmentId: string,
    token?: string,
  ): Promise<WhatsappConversationSummary>;

  sendMessage(
    id: string,
    establishmentId: string,
    text: string,
    token?: string,
  ): Promise<WhatsappMessageItem>;

  openForCustomer(
    customerId: string,
    establishmentId: string,
    token?: string,
  ): Promise<WhatsappConversationSummary>;
}
