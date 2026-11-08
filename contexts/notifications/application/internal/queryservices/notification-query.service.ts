import type { NotificationQueryService } from "../../services/notification-query.service";
import type { PaginatedNotifications } from "../../../domain/model/entities/notification";

/**
 * Server-only port for notification reads. Implementation lives in
 * Infrastructure and is injected via composition.
 */
export interface NotificationQueryPort {
  getNotifications(accessToken: string, page: number, size: number): Promise<PaginatedNotifications>;
  getUnreadCount(accessToken: string): Promise<number>;
}

export class NotificationQueryServiceImpl implements NotificationQueryService {
  constructor(private readonly gateway: NotificationQueryPort) {}

  getNotifications(accessToken: string, page = 0, size = 10): Promise<PaginatedNotifications> {
    return this.gateway.getNotifications(accessToken, page, size);
  }

  getUnreadCount(accessToken: string): Promise<number> {
    return this.gateway.getUnreadCount(accessToken);
  }
}

export function createNotificationQueryService(
  gateway: NotificationQueryPort,
): NotificationQueryService {
  return new NotificationQueryServiceImpl(gateway);
}
