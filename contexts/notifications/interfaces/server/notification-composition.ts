import "server-only";

import { NotificationApiGateway } from "../../infrastructure/gateways/notification-api.gateway";
import { NotificationQueryServiceImpl } from "../../application/internal/queryservices/notification-query.service";
import { NotificationCommandServiceImpl } from "../../application/internal/commandservices/notification-command.service";

/**
 * Server-only composition for the Notifications bounded context.
 *
 * Composition returns a fresh set of adapters per invocation. The device-token
 * registration endpoint MUST be routed through this composition: a previous
 * implementation reached for the gateway via a dynamic import, which leaked
 * past the Application boundary.
 */
export type ComposedNotificationAdapters = Readonly<{
  gateway: NotificationApiGateway;
  queryService: NotificationQueryServiceImpl;
  commandService: NotificationCommandServiceImpl;
}>;

export function composeNotificationAdapters(): ComposedNotificationAdapters {
  const gateway = new NotificationApiGateway();
  return {
    gateway,
    queryService: new NotificationQueryServiceImpl(gateway),
    commandService: new NotificationCommandServiceImpl(gateway),
  };
}
