import { z } from "zod";

export const whatsappConversationStatusSchema = z.enum(["BOT_ACTIVE", "NEEDS_HUMAN", "HUMAN_TAKEN"]);
export const whatsappMessageDirectionSchema = z.enum(["INBOUND", "OUTBOUND_BOT", "OUTBOUND_HUMAN"]);
export const whatsappDeliveryStatusSchema = z.enum(["SENT", "DELIVERED", "READ", "FAILED"]);

export const chatCustomerSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  documentType: z.string(),
  documentNumber: z.string(),
  phoneNumber: z.string().nullable().optional(),
  phoneCountryCode: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
});

export const whatsappConversationSummarySchema = z.object({
  id: z.string(),
  customerId: z.string().nullable().optional(),
  customerName: z.string().nullable().optional(),
  contactPhone: z.string(),
  contactDisplayName: z.string().nullable().optional(),
  status: whatsappConversationStatusSchema,
  summaryTag: z.string().nullable().optional(),
  unreadCount: z.number().int().nonnegative(),
  lastMessagePreview: z.string().nullable().optional(),
  lastMessageAt: z.string(),
  customerServiceWindowOpen: z.boolean(),
});

export const whatsappMessageItemSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  whatsappMessageId: z.string().nullable().optional(),
  direction: whatsappMessageDirectionSchema,
  messageType: z.string(),
  content: z.string(),
  deliveryStatus: whatsappDeliveryStatusSchema,
  sentByUserId: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const whatsappConversationDetailSchema = z.object({
  conversation: whatsappConversationSummarySchema,
  messages: z.array(whatsappMessageItemSchema),
  customer: chatCustomerSummarySchema.nullable().optional(),
});

export const whatsappConversationPageResponseSchema = z.object({
  content: z.array(whatsappConversationSummarySchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
