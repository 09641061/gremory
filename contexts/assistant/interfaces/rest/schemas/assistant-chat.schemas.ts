import { z } from "zod";

export const submitAssistantMessageSchema = z.object({
  conversationId: z.string().min(1).optional().nullable(),
  message: z.string().trim().min(1).max(4000),
  establishmentId: z.string().uuid().optional().nullable(),
});

export type SubmitAssistantMessageInput = z.infer<typeof submitAssistantMessageSchema>;

export const assistantConversationListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(100).default(20),
});

export type AssistantConversationListQueryInput = z.infer<
  typeof assistantConversationListQuerySchema
>;

export const assistantConversationIdParamSchema = z.object({
  id: z.string().min(1),
});

export type AssistantConversationIdParamInput = z.infer<
  typeof assistantConversationIdParamSchema
>;

export const assistantConversationCreateSchema = z.object({
  messageContent: z.string().trim().min(1).max(4000),
  establishmentId: z.string().uuid().optional().nullable(),
});

export type AssistantConversationCreateInput = z.infer<
  typeof assistantConversationCreateSchema
>;

export const assistantConversationRenameSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export type AssistantConversationRenameInput = z.infer<
  typeof assistantConversationRenameSchema
>;

export const assistantConversationMessageSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  establishmentId: z.string().uuid().optional().nullable(),
});

export type AssistantConversationMessageInput = z.infer<
  typeof assistantConversationMessageSchema
>;
