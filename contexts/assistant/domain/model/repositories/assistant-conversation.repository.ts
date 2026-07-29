import type { AssistantConversation } from "../entities/assistant-conversation";
import type { CreateConversationCommand } from "../commands/create-conversation.command";
import type { DeleteConversationCommand } from "../commands/delete-conversation.command";
import type { RenameConversationCommand } from "../commands/rename-conversation.command";
import type { SendMessageCommand } from "../commands/send-message.command";

export interface AssistantConversationRepository {
  getConversation(conversationId: string, token?: string): Promise<AssistantConversation>;
  createConversation(command: CreateConversationCommand, token?: string): Promise<AssistantConversation>;
  sendMessage(command: SendMessageCommand, token?: string): Promise<AssistantConversation>;
  renameConversation(command: RenameConversationCommand, token?: string): Promise<AssistantConversation>;
  deleteConversation(command: DeleteConversationCommand, token?: string): Promise<void>;
}
