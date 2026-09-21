"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  fetchNotificationsAction,
  fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction,
  deleteNotificationAction,
} from "@/contexts/notifications/interfaces/actions/notification.actions";
import type {
  AppNotification,
  PaginatedNotifications,
} from "@/contexts/notifications/domain/model/entities/notification";

/**
 * Default polling cadence for the unread badge. Matches the cadence the
 * notification dropdown used before notifications were centralised.
 */
export const NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS = 15_000;

export type UseNotificationsApi = Readonly<{
  /** Latest unread count, polled automatically by the provider. */
  unreadCount: number;
  /** Latest notifications page returned by `loadNotifications`, if any. */
  notifications: PaginatedNotifications | null;
  /** Re-fetches the unread count. Safe to call from any consumer. */
  refresh: () => Promise<void>;
  /**
   * Fetches a page of notifications and caches it on the provider so all
   * consumers share the same snapshot. Returns null if the action fails.
   */
  loadNotifications: (page?: number, size?: number) => Promise<PaginatedNotifications | null>;
  /** Marks a notification as read via the server action and re-syncs the badge. */
  markAsRead: (id: string) => Promise<void>;
  /** Deletes a notification via the server action and re-syncs the badge. */
  delete: (id: string) => Promise<void>;
  /** True while the initial unread-count fetch is in flight. */
  isLoadingUnread: boolean;
}>;

const NotificationsContext = createContext<UseNotificationsApi | null>(null);

export type NotificationsProviderProps = Readonly<{
  children: ReactNode;
  /**
   * Override the polling cadence in milliseconds. Defaults to
   * {@link NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS}. Pass `null` to disable
   * polling (manual `refresh` calls still work).
   */
  pollIntervalMs?: number | null;
}>;

/**
 * Single source of truth for notification state across the app.
 *
 * Owns the unread-count polling so consumers (the dropdown, a sidebar badge,
 * a status page) never duplicate intervals. The provider starts polling on
 * mount, refreshes whenever a `markAsRead` / `delete` mutation resolves, and
 * keeps the latest notifications page in cache so consumers can read it
 * synchronously after `loadNotifications` resolves.
 */
export function NotificationsProvider({
  children,
  pollIntervalMs = NOTIFICATIONS_DEFAULT_POLL_INTERVAL_MS,
}: NotificationsProviderProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<PaginatedNotifications | null>(null);
  const [isLoadingUnread, setIsLoadingUnread] = useState(true);

  // Avoids running an out-of-date fetch response against newer state.
  const unreadRequestId = useRef(0);
  // Tracks whether the provider is still mounted, so an in-flight refresh that
  // resolves after unmount does not call setState.
  const isMounted = useRef(true);

  const refresh = useCallback(async () => {
    const requestId = ++unreadRequestId.current;
    if (requestId === 1) {
      setIsLoadingUnread(true);
    }
    try {
      const count = await fetchUnreadNotificationsCountAction();
      if (!isMounted.current || requestId !== unreadRequestId.current) {
        return;
      }
      setUnreadCount(count);
    } finally {
      if (isMounted.current && requestId === unreadRequestId.current) {
        setIsLoadingUnread(false);
      }
    }
  }, []);

  const loadNotifications = useCallback(
    async (page = 0, size = 10): Promise<PaginatedNotifications | null> => {
      const data = await fetchNotificationsAction(page, size);
      if (!isMounted.current) {
        return data;
      }
      if (data) {
        setNotifications(data);
      }
      return data;
    },
    [],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      await markNotificationAsReadAction(id);
      // Re-sync the badge with the server and trim the cached page so the UI
      // does not display a "UNREAD" item after the mutation completes.
      await refresh();
      if (!isMounted.current) return;
      setNotifications((current) => {
        if (!current) return current;
        return {
          ...current,
          content: current.content.map((item) =>
            item.id === id ? { ...item, status: "READ" as const } : item,
          ),
        };
      });
    },
    [refresh],
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      await deleteNotificationAction(id);
      await refresh();
      if (!isMounted.current) return;
      setNotifications((current) => {
        if (!current) return current;
        return {
          ...current,
          content: current.content.filter((item: AppNotification) => item.id !== id),
          totalElements: Math.max(0, current.totalElements - 1),
        };
      });
    },
    [refresh],
  );

  // Single polling interval for the entire app.
  useEffect(() => {
    isMounted.current = true;
    refresh();
    if (pollIntervalMs == null) {
      return () => {
        isMounted.current = false;
      };
    }
    const interval = window.setInterval(() => {
      refresh();
    }, pollIntervalMs);
    return () => {
      window.clearInterval(interval);
      isMounted.current = false;
    };
  }, [pollIntervalMs, refresh]);

  const value = useMemo<UseNotificationsApi>(
    () => ({
      unreadCount,
      notifications,
      refresh,
      loadNotifications,
      markAsRead,
      delete: deleteNotification,
      isLoadingUnread,
    }),
    [unreadCount, notifications, refresh, loadNotifications, markAsRead, deleteNotification, isLoadingUnread],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

/**
 * Subscribes a component to the notifications provider.
 *
 * Throws when used outside of a {@link NotificationsProvider} so the failure is
 * loud at development time instead of silently rendering stale state.
 */
export function useNotifications(): UseNotificationsApi {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return ctx;
}