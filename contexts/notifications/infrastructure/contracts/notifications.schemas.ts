import { z } from "zod";

export const notificationSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  type: z.enum(["WORKFORCE_INVITATION", "SYSTEM"]),
  title: z.string(),
  message: z.string(),
  status: z.enum(["UNREAD", "READ", "DISMISSED"]),
  targetId: z.string().optional(),
  targetToken: z.string().optional(),
  organizationName: z.string().optional(),
  establishmentName: z.string().optional(),
  createdAt: z.string(),
  // Optional while older backend deployments omit these fields. UI behavior
  // must use these explicit values when supplied, never localized text.
  action: z.enum(["ACCEPT_INVITATION", "NONE"]).optional(),
  state: z.enum(["PENDING", "ACCEPTED", "READ", "DISMISSED"]).optional(),
});

export const paginatedNotificationsSchema = z.object({
  content: z.array(notificationSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export const unreadCountResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});

export const acceptanceResultSchema = z.object({
  organizationId: z.string().min(1),
  establishmentId: z.string().min(1),
});

/** 204 is valid for a write; some backend versions return a small ack object. */
export const writeAckResponseSchema = z.union([
  z.undefined(),
  z.object({
    success: z.boolean().optional(),
    message: z.string().optional(),
  }).strict(),
]);

export const deviceTokenResponseSchema = writeAckResponseSchema;
export const deleteNotificationResponseSchema = writeAckResponseSchema;

export type NotificationContract = z.infer<typeof notificationSchema>;
export type PaginatedNotificationsContract = z.infer<typeof paginatedNotificationsSchema>;
export type AcceptanceResultContract = z.infer<typeof acceptanceResultSchema>;
export type NotificationAction = z.infer<typeof notificationSchema>["action"];
export type NotificationState = z.infer<typeof notificationSchema>["state"];
