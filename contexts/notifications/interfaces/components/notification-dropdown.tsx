"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, MoreVertical, Trash2, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import type { AppNotification, PaginatedNotifications } from "../../domain/model/entities/notification";
import {
  fetchNotificationsAction,
  fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction,
  deleteNotificationAction,
  acceptInvitationNotificationAction,
} from "../actions/notification.actions";
import { cn } from "@/lib/utils";
import { useNotificationTranslations } from "@/contexts/notifications/interfaces/i18n";

type NotificationDropdownProps = {
  variant?: "default" | "compact";
};

export function NotificationDropdown({ variant = "default" }: NotificationDropdownProps = {}) {
  const { t, locale } = useNotificationTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [paginatedData, setPaginatedData] = useState<PaginatedNotifications | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPending, startTransition] = useTransition();

  const loadNotifications = (page = 0) => {
    startTransition(async () => {
      const data = await fetchNotificationsAction(page, 5);
      if (data) {
        setPaginatedData(data);
        setCurrentPage(data.number);
      }
    });
  };

  const loadUnreadCount = () => {
    fetchUnreadNotificationsCountAction().then((count) => setUnreadCount(count));
  };

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications(currentPage);
      loadUnreadCount();
    }
  }, [isOpen, currentPage]);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    loadNotifications(currentPage);
    loadUnreadCount();
  };

  const handleDelete = async (id: string) => {
    await deleteNotificationAction(id);
    loadNotifications(currentPage);
    loadUnreadCount();
  };

  const handleAcceptInvitation = async (notificationId: string, token?: string) => {
    await acceptInvitationNotificationAction(notificationId, token || "");
    loadNotifications(currentPage);
    loadUnreadCount();
    window.location.reload();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className={cn(
          "relative inline-flex items-center justify-center text-muted-foreground outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-accent data-popup-open:text-accent-foreground",
          variant === "compact"
            ? "size-7 rounded-md"
            : "size-9 shrink-0 rounded-full border border-border/70 bg-background shadow-xs",
        )}
        aria-label={t.notifications.title}
      >
        <Bell className={variant === "compact" ? "size-3.5" : "size-4"} />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full font-bold",
              variant === "compact"
                ? "top-1 right-1 size-2 bg-primary ring-1 ring-card"
                : "-right-0.5 -top-0.5 size-3 bg-primary text-[8px] text-primary-foreground ring-2 ring-background",
            )}
          >
            {variant === "compact" ? (
              <span className="sr-only">{unreadCount > 9 ? "9+" : unreadCount}</span>
            ) : (
              unreadCount > 9 ? "9+" : unreadCount
            )}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="end" className="w-80 p-0 shadow-lg">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <h4 className="text-sm font-semibold text-foreground">{t.notifications.title}</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {t.notifications.unreadNew.replace("{count}", String(unreadCount))}
            </Badge>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {!paginatedData || paginatedData.content.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              {t.notifications.empty}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {paginatedData.content.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  locale={locale}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onAcceptInvitation={handleAcceptInvitation}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </div>

        {paginatedData && paginatedData.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 px-3 py-2 text-xs text-muted-foreground">
            <span>
              {t.notifications.page
                .replace("{page}", String(paginatedData.number + 1))
                .replace("{totalPages}", String(paginatedData.totalPages))}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={paginatedData.first || isPending}
                onClick={() => loadNotifications(currentPage - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={paginatedData.last || isPending}
                onClick={() => loadNotifications(currentPage + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationItem({
  notification,
  locale,
  onMarkAsRead,
  onDelete,
  onAcceptInvitation,
  isPending,
}: {
  notification: AppNotification;
  locale: string;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAcceptInvitation: (id: string, token?: string) => void;
  isPending: boolean;
}) {
  const { t } = useNotificationTranslations();
  const isUnread = notification.status === "UNREAD";
  const isPendingInvitation =
    notification.type === "WORKFORCE_INVITATION" &&
    !notification.title.toLowerCase().includes("accepted");

  return (
    <div
      className={cn(
        "group relative flex items-start justify-between gap-2 p-3 transition-colors hover:bg-muted/40",
        isUnread && "bg-accent/20"
      )}
    >
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-foreground truncate">
              {notification.title}
            </span>
            {isUnread && (
              <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>

          {isPendingInvitation && (
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 px-2.5 text-xs font-medium"
                disabled={isPending}
                onClick={() => onAcceptInvitation(notification.id, notification.targetToken)}
              >
                <CheckCircle2 className="mr-1 size-3.5" />
                {t.notifications.accept}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={isPending}
                onClick={() => onDelete(notification.id)}
              >
                <XCircle className="mr-1 size-3.5" />
                {t.notifications.decline}
              </Button>
            </div>
          )}

          <span className="mt-1.5 block text-[10px] text-muted-foreground/70">
            {new Date(notification.createdAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* 3-Dots Action Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="shrink-0 size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none"
          aria-label={t.notifications.actionsAria}
        >
          <MoreVertical className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          {isUnread && (
            <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
              <CheckCircle2 className="mr-2 size-3.5 text-muted-foreground" />
              {t.notifications.markAsRead}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(notification.id)}
          >
            <Trash2 className="mr-2 size-3.5" />
            {t.notifications.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
