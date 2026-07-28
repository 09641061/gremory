import { z } from "zod";

export const submitAssistantMessageSchema = z.object({
  conversationId: z.string().min(1).optional().nullable(),
  message: z.string().trim().min(1).max(4000),
});

export type SubmitAssistantMessageInput = z.infer<typeof submitAssistantMessageSchema>;
