export const en = {
  notifications: {
    title: "Notifications",
    unreadNew: "{count} new",
    empty: "You have no pending notifications",
    page: "Page {page} of {totalPages}",
    accept: "Accept",
    decline: "Decline",
    actionsAria: "Notification actions",
    markAsRead: "Mark as read",
    delete: "Delete",
  },
} as const;

import type { StringLeaf } from "@/contexts/shared/interfaces/i18n/federated";

export type NotificationTranslations = StringLeaf<typeof en>;
