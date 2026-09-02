import "server-only";

import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import type { AppNotification, PaginatedNotifications } from "../../domain/model/entities/notification";

export class NotificationApiError extends ApiError {
  constructor(message: string, status: number, details?: unknown) {
    super(message, status, details);
    this.name = "NotificationApiError";
  }
}

export type AcceptanceResult = {
  organizationId: string;
  establishmentId: string;
};

export class NotificationApiGateway {
  async getNotifications(accessToken: string, page = 0, size = 10): Promise<PaginatedNotifications> {
    const url = `${apiConfig.routes.notifications}?page=${page}&size=${size}`;
    return apiClient.get<PaginatedNotifications>(url, {
      token: accessToken,
      errorMessage: "Failed to retrieve notifications",
      errorType: NotificationApiError,
    });
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
    const url = `${apiConfig.routes.notifications}/${id}/read`;
    return apiClient.patch<AppNotification>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as read",
      errorType: NotificationApiError,
    });
  }

  async acceptNotification(accessToken: string, id: string): Promise<AppNotification> {
    const url = `${apiConfig.routes.notifications}/${id}/accept`;
    return apiClient.patch<AppNotification>(url, {}, {
      token: accessToken,
      errorMessage: "Failed to mark notification as accepted",
      errorType: NotificationApiError,
    });
  }

  async deleteNotification(accessToken: string, id: string): Promise<void> {
    const url = `${apiConfig.routes.notifications}/${id}`;
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
}

export const notificationApiGateway = new NotificationApiGateway();
