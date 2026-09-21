import type { NotificationCommandService as DomainNotificationCommandService } from "../../domain/services/notification-command.service";

export interface NotificationCommandService extends DomainNotificationCommandService {
  registerDeviceToken(deviceToken: string, platform: "WEB" | "ANDROID" | "IOS", accessToken: string): Promise<void>;
}
