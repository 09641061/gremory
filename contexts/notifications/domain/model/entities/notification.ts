export type NotificationType = "WORKFORCE_INVITATION" | "SYSTEM";
export type NotificationStatus = "UNREAD" | "READ" | "DISMISSED";
export type NotificationAction = "ACCEPT_INVITATION" | "NONE";
export type NotificationState = "PENDING" | "ACCEPTED" | "READ" | "DISMISSED";

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
  /** Backend-provided intent; optional for compatibility with older responses. */
  action?: NotificationAction;
  /** Backend-provided lifecycle state; optional for compatibility with older responses. */
  state?: NotificationState;
}

export interface PaginatedNotifications {
  content: AppNotification[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
