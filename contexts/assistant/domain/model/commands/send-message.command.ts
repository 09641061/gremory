export interface SendMessageCommand {
  conversationId: string;
  message: string;
  establishmentId?: string | null;
}
