import "server-only";

import { z } from "zod";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { AppNotification, PaginatedNotifications } from "../../domain/model/entities/notification";
import {
  acceptanceResultSchema,
  deviceTokenResponseSchema,
  notificationSchema,
  paginatedNotificationsSchema,
  deleteNotificationResponseSchema,
  unreadCountResponseSchema,
} from "../contracts/notifications.schemas";
import type {
  NotificationCommandPort,
} from "../../application/internal/commandservices/notification-command.service";
import type {
  NotificationQueryPort,
} from "../../application/internal/queryservices/notification-query.service";

export class NotificationApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown, options?: ErrorOptions) {
    super(message, status, details, options);
    this.name = "NotificationApiError";
  }
}

export type AcceptanceResult = {
  organizationId: string;
  establishmentId: string;
};

export class NotificationApiGateway
  implements NotificationCommandPort, NotificationQueryPort
{
  async getNotifications(accessToken: string, page = 0, size = 10): Promise<PaginatedNotifications> {
    const safePage = Number.isInteger(page) && page >= 0 ? Math.min(page, 10_000) : 0;
    const safeSize = Number.isInteger(size) && size > 0 ? Math.min(size, 100) : 10;
    const url = `${apiConfig.routes.notifications}?page=${safePage}&size=${safeSize}`;
    const response = await apiClient.get<unknown>(url, {
      token: accessToken,
      errorMessage: "Failed to retrieve notifications",
      errorType: NotificationApiError,
    });
    return parseProviderResponse(paginatedNotificationsSchema, response, "notification page");
  }

  async getUnreadCount(accessToken: string): Promise<number> {
    const url = `${apiConfig.routes.notifications}/unread-count`;
    const response = await apiClient.get<unknown>(url, {
      token: accessToken,
      errorMessage: "Failed to get unread notifications count",
      errorType: NotificationApiError,
    });
    return parseProviderResponse(unreadCountResponseSchema, response, "unread count").unreadCount;
  }

  async markAsRead(accessToken: string, id: string): Promise<AppNotification> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}/read`;
    const response = await apiClient.patch<unknown>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as read",
      errorType: NotificationApiError,
    });
    return parseProviderResponse(notificationSchema, response, "notification");
  }

  async acceptNotification(accessToken: string, id: string): Promise<AppNotification> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}/accept`;
    const response = await apiClient.patch<unknown>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as accepted",
      errorType: NotificationApiError,
    });
    return parseProviderResponse(notificationSchema, response, "notification");
  }

  async deleteNotification(accessToken: string, id: string): Promise<void> {
    const url = `${apiConfig.routes.notifications}/${encodeURIComponent(id)}`;
    const response = await apiClient.delete<unknown>(url, {
      token: accessToken,
      errorMessage: "Failed to delete notification",
      errorType: NotificationApiError,
    });
    parseProviderResponse(deleteNotificationResponseSchema, response, "notification deletion");
  }

  async acceptInvitation(accessToken: string, token?: string): Promise<AcceptanceResult> {
    const url = token && token.trim().length > 0
      ? `${apiConfig.routes.workforce.invitations}/accept`
      : `${apiConfig.routes.workforce.invitations}/accept-pending`;
    const response = await apiClient.post<unknown>(url, token ? { token } : {}, {
      token: accessToken,
      errorMessage: token ? "Failed to accept invitation" : "Failed to accept pending invitation",
      errorType: NotificationApiError,
    });
    return parseProviderResponse(acceptanceResultSchema, response, "invitation acceptance");
  }

  async registerDeviceToken(accessToken: string, deviceToken: string, platform = "WEB"): Promise<void> {
    const url = `${apiConfig.routes.notifications}/device-tokens`;
    const response = await apiClient.post<unknown>(url, { deviceToken, platform }, {
      token: accessToken,
      errorMessage: "Failed to register device token",
      errorType: NotificationApiError,
    });
    parseProviderResponse(deviceTokenResponseSchema, response, "device token");
  }
}

function parseProviderResponse<T extends z.ZodTypeAny>(
  schema: T,
  response: unknown,
  resource: string,
): z.infer<T> {
  try {
    return schema.parse(response);
  } catch (cause) {
    throw new NotificationApiError(`Invalid notification ${resource} response`, 502, undefined, { cause });
  }
}
