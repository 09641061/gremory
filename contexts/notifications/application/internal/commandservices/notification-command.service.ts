import "server-only";

import type { NotificationCommandService } from "../../services/notification-command.service";
import type { MarkNotificationReadCommand } from "../../../domain/model/commands/mark-notification-read.command";
import type { DeleteNotificationCommand } from "../../../domain/model/commands/delete-notification.command";
import type { AcceptInvitationNotificationCommand } from "../../../domain/model/commands/accept-invitation-notification.command";
import type { AppNotification } from "../../../domain/model/entities/notification";
import { NotificationApiGateway } from "../../../infrastructure/gateways/notification-api.gateway";

export class NotificationCommandServiceImpl implements NotificationCommandService {
  constructor(private readonly gateway: NotificationApiGateway) {}

  markAsRead(command: MarkNotificationReadCommand, accessToken: string): Promise<AppNotification> {
    return this.gateway.markAsRead(accessToken, command.id);
  }

  deleteNotification(command: DeleteNotificationCommand, accessToken: string): Promise<void> {
    return this.gateway.deleteNotification(accessToken, command.id);
  }

  async acceptInvitation(command: AcceptInvitationNotificationCommand, accessToken: string): Promise<void> {
    if (command.invitationToken) {
      await this.gateway.acceptInvitation(accessToken, command.invitationToken);
    }
    await this.gateway.deleteNotification(accessToken, command.notificationId);
  }
}
