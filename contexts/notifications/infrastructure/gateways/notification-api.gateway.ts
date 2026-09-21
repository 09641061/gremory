import "server-only";

import { z } from "zod";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { AppNotification, PaginatedNotifications } from "../../domain/model/entities/notification";

export class NotificationApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "NotificationApiError";
  }
}

const notificationSchema = z.object({
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
});
const paginatedNotificationsSchema = z.object({
  content: z.array(notificationSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type AcceptanceResult = {
  organizationId: string;
  establishmentId: string;
};

export class NotificationApiGateway {
  async getNotifications(accessToken: string, page = 0, size = 10): Promise<PaginatedNotifications> {
    const safePage = Number.isInteger(page) && page >= 0 ? Math.min(page, 10_000) : 0;
    const safeSize = Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 10;
    const url = `${apiConfig.routes.notifications}?page=${safePage}&size=${safeSize}`;
    const response = await apiClient.get<unknown>(url, {
      token: accessToken,
      errorMessage: "Failed to retrieve notifications",
      errorType: NotificationApiError,
    });
    return paginatedNotificationsSchema.parse(response);
  }

  async getUnreadCount(accessToken: string): Promise<number> {
    const url = `${apiConfig.routes.notifications}/unread-count`;
    const res = await apiClient.get<{ unreadCount: number }>(url, {
      token: accessToken,
      errorMessage: "Failed to get unread notifications count",
      errorType: NotificationApiError,
    });
    return res.unreadCount;
  }

  async markAsRead(accessToken: string, id: string): Promise<AppNotification> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}/read`;
    return apiClient.patch<AppNotification>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as read",
      errorType: NotificationApiError,
    });
  }

  async acceptNotification(accessToken: string, id: string): Promise<AppNotification> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}/accept`;
    return apiClient.patch<AppNotification>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as accepted",
      errorType: NotificationApiError,
    });
  }

  async deleteNotification(accessToken: string, id: string): Promise<void> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}`;
    return apiClient.delete<void>(url, {
      token: accessToken,
      errorMessage: "Failed to delete notification",
      errorType: NotificationApiError,
    });
  }

  async acceptInvitation(accessToken: string, token?: string): Promise<AcceptanceResult> {
    if (token && token.trim().length > 0) {
      const url = `${apiConfig.routes.workforce.invitations}/accept`;
      return apiClient.post<AcceptanceResult>(url, { token }, {
        token: accessToken,
        errorMessage: "Failed to accept invitation",
        errorType: NotificationApiError,
      });
    } else {
      const url = `${apiConfig.routes.workforce.invitations}/accept-pending`;
      return apiClient.post<AcceptanceResult>(url, {}, {
        token: accessToken,
        errorMessage: "Failed to accept pending invitation",
        errorType: NotificationApiError,
      });
    }
  }

  async registerDeviceToken(accessToken: string, deviceToken: string, platform = "WEB"): Promise<void> {
    const url = `${apiConfig.routes.notifications}/device-tokens`;
    return apiClient.post<void>(url, { deviceToken, platform }, {
      token: accessToken,
      errorMessage: "Failed to register device token",
      errorType: NotificationApiError,
    });
  }
}

export const notificationApiGateway = new NotificationApiGateway();
