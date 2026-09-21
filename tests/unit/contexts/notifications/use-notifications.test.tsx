/** @vitest-environment jsdom */
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchNotificationsAction: vi.fn(),
  fetchUnreadNotificationsCountAction: vi.fn(),
  markNotificationAsReadAction: vi.fn(),
  deleteNotificationAction: vi.fn(),
}));

vi.mock("@/contexts/notifications/interfaces/actions/notification.actions", () => ({
  fetchNotificationsAction: mocks.fetchNotificationsAction,
  fetchUnreadNotificationsCountAction: mocks.fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction: mocks.markNotificationAsReadAction,
  deleteNotificationAction: mocks.deleteNotificationAction,
}));

import {
  NotificationsProvider,
  useNotifications,
} from "@/contexts/notifications/interfaces/components/hooks/use-notifications";

function makeUnreadResponse(count: number) {
  return Promise.resolve(count);
}

function makeNotificationsResponse() {
  return Promise.resolve({
    content: [
      {
        id: "n-1",
        userId: "user-1",
        type: "SYSTEM",
        title: "Welcome",
        message: "Hi",
        status: "UNREAD",
        createdAt: "2025-01-01T00:00:00.000Z",
      },
    ],
    page: 0,
    size: 10,
    totalElements: 1,
    totalPages: 1,
  });
}

type Wrapper = (props: { children: ReactNode }) => ReactNode;

const defaultWrapper: Wrapper = ({ children }) => (
  <NotificationsProvider>{children}</NotificationsProvider>
);

describe("useNotifications", () => {
  beforeEach(() => {
    mocks.fetchUnreadNotificationsCountAction.mockReset();
    mocks.fetchNotificationsAction.mockReset();
    mocks.markNotificationAsReadAction.mockReset();
    mocks.deleteNotificationAction.mockReset();
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(3));
    mocks.fetchNotificationsAction.mockImplementation(() => makeNotificationsResponse());
    mocks.markNotificationAsReadAction.mockResolvedValue({ success: true });
    mocks.deleteNotificationAction.mockResolvedValue({ success: true });
  });

  it("provides initial state with a zeroed unread count until the first fetch resolves", async () => {
    let resolveCount: ((count: number) => void) | undefined;
    mocks.fetchUnreadNotificationsCountAction.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveCount = resolve;
        }),
    );

    const { result } = renderHook(() => useNotifications(), { wrapper: defaultWrapper });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.isLoadingUnread).toBe(true);

    await act(async () => {
      resolveCount?.(5);
    });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(5);
    });
    expect(result.current.isLoadingUnread).toBe(false);
  });

  it("exposes the unread count returned by the server action", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(7));

    const { result } = renderHook(() => useNotifications(), { wrapper: defaultWrapper });

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(7);
    });
  });

  it("calls the server action again when refresh is invoked", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(0));

    const { result } = renderHook(() => useNotifications(), { wrapper: defaultWrapper });

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
    });

    mocks.fetchUnreadNotificationsCountAction.mockImplementationOnce(() => makeUnreadResponse(2));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(2);
    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });
  });

  it("marks a notification as read, refreshes the count, and updates the cached page", async () => {
    let unread = 4;
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(unread));

    const { result } = renderHook(() => useNotifications(), { wrapper: defaultWrapper });

    await act(async () => {
      await result.current.loadNotifications(0, 10);
    });

    expect(result.current.notifications?.content[0].status).toBe("UNREAD");
    unread = 3;
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(unread));

    await act(async () => {
      await result.current.markAsRead("n-1");
    });

    expect(mocks.markNotificationAsReadAction).toHaveBeenCalledWith("n-1");
    await waitFor(() => {
      expect(result.current.unreadCount).toBe(3);
    });
    expect(result.current.notifications?.content[0].status).toBe("READ");
  });

  it("deletes a notification, refreshes the count, and trims the cached page", async () => {
    let unread = 2;
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(unread));

    const { result } = renderHook(() => useNotifications(), { wrapper: defaultWrapper });

    await act(async () => {
      await result.current.loadNotifications(0, 10);
    });

    expect(result.current.notifications?.content).toHaveLength(1);
    expect(result.current.notifications?.totalElements).toBe(1);

    unread = 1;
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(unread));

    await act(async () => {
      await result.current.delete("n-1");
    });

    expect(mocks.deleteNotificationAction).toHaveBeenCalledWith("n-1");
    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });
    expect(result.current.notifications?.content).toHaveLength(0);
    expect(result.current.notifications?.totalElements).toBe(0);
  });

  it("polls the unread count on the configured interval", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(0));

    // Short interval keeps the test fast while still exercising the same
    // setInterval code path as production.
    const fastPollingWrapper: Wrapper = ({ children }) => (
      <NotificationsProvider pollIntervalMs={50}>{children}</NotificationsProvider>
    );

    renderHook(() => useNotifications(), { wrapper: fastPollingWrapper });

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationsCountAction.mock.calls.length).toBeGreaterThan(2);
    });
  });

  it("does not poll when pollIntervalMs is null", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(0));

    const nullWrapper: Wrapper = ({ children }) => (
      <NotificationsProvider pollIntervalMs={null}>{children}</NotificationsProvider>
    );

    const { unmount } = renderHook(() => useNotifications(), { wrapper: nullWrapper });

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
    });

    // Wait long enough that an interval would have fired several times.
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);

    unmount();
  });

  it("stops polling on unmount", async () => {
    mocks.fetchUnreadNotificationsCountAction.mockImplementation(() => makeUnreadResponse(0));

    const fastPollingWrapper: Wrapper = ({ children }) => (
      <NotificationsProvider pollIntervalMs={50}>{children}</NotificationsProvider>
    );

    const { unmount } = renderHook(() => useNotifications(), { wrapper: fastPollingWrapper });

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Wait long enough that an interval would have fired several times.
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
  });

  it("throws when used outside a NotificationsProvider", () => {
    expect(() => renderHook(() => useNotifications())).toThrow(
      "useNotifications must be used within a NotificationsProvider",
    );
  });
});