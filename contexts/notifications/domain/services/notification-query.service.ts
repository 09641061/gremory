import type { PaginatedNotifications } from "../model/entities/notification";

export interface NotificationQueryService {
  getNotifications(accessToken: string, page?: number, size?: number): Promise<PaginatedNotifications>;
  getUnreadCount(accessToken: string): Promise<number>;
}
