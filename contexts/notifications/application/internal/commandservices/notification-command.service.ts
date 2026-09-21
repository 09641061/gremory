import type { NotificationCommandService } from "../../services/notification-command.service";
import type { MarkNotificationReadCommand } from "../../../domain/model/commands/mark-notification-read.command";
import type { DeleteNotificationCommand } from "../../../domain/model/commands/delete-notification.command";
import type { AcceptInvitationNotificationCommand } from "../../../domain/model/commands/accept-invitation-notification.command";
import type { AppNotification } from "../../../domain/model/entities/notification";

/**
 * Server-only port for notification mutations. Implementation lives in
 * Infrastructure and is injected via composition.
 */
export interface NotificationCommandPort {
  markAsRead(accessToken: string, id: string): Promise<AppNotification>;
  deleteNotification(accessToken: string, id: string): Promise<void>;
  acceptNotification(accessToken: string, notificationId: string): Promise<AppNotification>;
  acceptInvitation(
    accessToken: string,
    invitationToken?: string,
  ): Promise<{ organizationId?: string; establishmentId?: string }>;
  registerDeviceToken(
    accessToken: string,
    deviceToken: string,
    platform: "WEB" | "ANDROID" | "IOS",
  ): Promise<void>;
}

export class NotificationCommandServiceImpl implements NotificationCommandService {
  constructor(private readonly gateway: NotificationCommandPort) {}

  markAsRead(command: MarkNotificationReadCommand, accessToken: string): Promise<AppNotification> {
    return this.gateway.markAsRead(accessToken, command.id);
  }

  async deleteNotification(command: DeleteNotificationCommand, accessToken: string): Promise<void> {
    // Deletion is a single backend operation. Marking first creates a second
    // mutation that can fail after the user already requested deletion.
    await this.gateway.deleteNotification(accessToken, command.id);
  }

  async acceptInvitation(
    command: AcceptInvitationNotificationCommand,
    accessToken: string
  ): Promise<{ organizationId?: string; establishmentId?: string }> {
    await this.gateway.acceptNotification(accessToken, command.notificationId);
    return this.gateway.acceptInvitation(accessToken, command.invitationToken);
  }



  acceptPendingInvitation(accessToken: string): Promise<{ organizationId?: string; establishmentId?: string }> {
    return this.gateway.acceptInvitation(accessToken);
  }

  registerDeviceToken(
    deviceToken: string,
    platform: "WEB" | "ANDROID" | "IOS",
    accessToken: string,
  ): Promise<void> {
    return this.gateway.registerDeviceToken(accessToken, deviceToken, platform);
  }
}

export function createNotificationCommandService(
  gateway: NotificationCommandPort,
): NotificationCommandService {
  return new NotificationCommandServiceImpl(gateway);
}
