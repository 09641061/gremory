import { z } from "zod";
import { pageResponseSchema } from "@/contexts/shared/interfaces/rest/schemas/page-response.schema";

const assistantMessageResponseSchema = z.object({
  id: z.string().min(1), sender: z.string().min(1), role: z.string().min(1),
  content: z.string(), createdAt: z.string().datetime({ offset: true }),
});
export const assistantConversationSummaryResponseSchema = z.object({
  id: z.string().min(1), userId: z.string().min(1), title: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }), updatedAt: z.string().datetime({ offset: true }),
});
export const assistantConversationResponseSchema = assistantConversationSummaryResponseSchema.extend({
  messages: z.array(assistantMessageResponseSchema),
});
export const assistantConversationPageResponseSchema = pageResponseSchema(assistantConversationSummaryResponseSchema);
