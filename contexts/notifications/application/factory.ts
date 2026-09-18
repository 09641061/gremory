import "server-only";

import { NotificationApiGateway } from "../infrastructure/gateways/notification-api.gateway";
import { NotificationCommandServiceImpl } from "./internal/commandservices/notification-command.service";
import { NotificationQueryServiceImpl } from "./internal/queryservices/notification-query.service";
import type { NotificationCommandService } from "./services/notification-command.service";
import type { NotificationQueryService } from "./services/notification-query.service";

let commandServiceInstance: NotificationCommandService | null = null;
let queryServiceInstance: NotificationQueryService | null = null;

export function createNotificationCommandService(): NotificationCommandService {
  if (!commandServiceInstance) {
    const gateway = new NotificationApiGateway();
    commandServiceInstance = new NotificationCommandServiceImpl(gateway);
  }
  return commandServiceInstance;
}

export function createNotificationQueryService(): NotificationQueryService {
  if (!queryServiceInstance) {
    const gateway = new NotificationApiGateway();
    queryServiceInstance = new NotificationQueryServiceImpl(gateway);
  }
  return queryServiceInstance;
}
