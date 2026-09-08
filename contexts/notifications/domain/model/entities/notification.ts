export type NotificationType = "WORKFORCE_INVITATION" | "SYSTEM";
export type NotificationStatus = "UNREAD" | "READ" | "DISMISSED";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  targetId?: string;
  targetToken?: string;
  organizationName?: string;
  establishmentName?: string;
  createdAt: string;
}

export interface PaginatedNotifications {
  content: AppNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
