import "server-only";

import type { NotificationQueryService } from "../../services/notification-query.service";
import type { PaginatedNotifications } from "../../../domain/model/entities/notification";
import { NotificationApiGateway } from "../../../infrastructure/gateways/notification-api.gateway";

export class NotificationQueryServiceImpl implements NotificationQueryService {
  constructor(private readonly gateway: NotificationApiGateway) {}

  getNotifications(accessToken: string, page = 0, size = 10): Promise<PaginatedNotifications> {
    return this.gateway.getNotifications(accessToken, page, size);
  }

  getUnreadCount(accessToken: string): Promise<number> {
    return this.gateway.getUnreadCount(accessToken);
  }
}
