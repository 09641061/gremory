export interface CreateConversationCommand {
  messageContent: string;
  establishmentId?: string | null;
}
