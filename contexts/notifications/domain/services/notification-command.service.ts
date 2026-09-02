import type { AppNotification } from "../model/entities/notification";
import type { MarkNotificationReadCommand } from "../model/commands/mark-notification-read.command";
import type { DeleteNotificationCommand } from "../model/commands/delete-notification.command";
import type { AcceptInvitationNotificationCommand } from "../model/commands/accept-invitation-notification.command";

export interface NotificationCommandService {
  markAsRead(command: MarkNotificationReadCommand, accessToken: string): Promise<AppNotification>;
  deleteNotification(command: DeleteNotificationCommand, accessToken: string): Promise<void>;
  acceptInvitation(command: AcceptInvitationNotificationCommand, accessToken: string): Promise<{ organizationId?: string; establishmentId?: string }>;
}
