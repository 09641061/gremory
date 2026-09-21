/** @vitest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";

const mocks = vi.hoisted(() => ({
  fetchNotificationsAction: vi.fn(),
  fetchUnreadNotificationsCountAction: vi.fn(),
  markNotificationAsReadAction: vi.fn(),
  deleteNotificationAction: vi.fn(),
  acceptInvitationNotificationAction: vi.fn(),
}));

vi.mock("@/contexts/notifications/interfaces/actions/notification.actions", () => ({
  fetchNotificationsAction: mocks.fetchNotificationsAction,
  fetchUnreadNotificationsCountAction: mocks.fetchUnreadNotificationsCountAction,
  markNotificationAsReadAction: mocks.markNotificationAsReadAction,
  deleteNotificationAction: mocks.deleteNotificationAction,
  acceptInvitationNotificationAction: mocks.acceptInvitationNotificationAction,
}));

import { NotificationsProvider } from "@/contexts/notifications/interfaces/components/hooks/use-notifications";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";

function makeNotificationsPage(content: unknown[], page = 0, totalPages = 1, totalElements = content.length) {
  return {
    content,
    page,
    size: 5,
    totalElements,
    totalPages,
  };
}

function makeItem(overrides: Record<string, unknown> = {}) {
  return {
    id: "n-1",
    userId: "user-1",
    type: "SYSTEM" as const,
    title: "Welcome",
    message: "Hi",
    status: "UNREAD" as const,
    createdAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function renderNotificationDropdown() {
  // Wrap in a NotificationsProvider with a slow polling cadence so the
  // background interval does not race the user-driven fetches in these tests.
  // `pollIntervalMs={null}` keeps the provider mounted but disables polling,
  // which mirrors production startup before the first poll fires.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationsProvider pollIntervalMs={null}>{children}</NotificationsProvider>
  );
  return render(<NotificationDropdown />, { wrapper });
}

describe("NotificationDropdown (using NotificationsProvider)", () => {
  beforeEach(() => {
    mocks.fetchNotificationsAction.mockReset();
    mocks.fetchUnreadNotificationsCountAction.mockReset();
    mocks.markNotificationAsReadAction.mockReset();
    mocks.deleteNotificationAction.mockReset();
    mocks.acceptInvitationNotificationAction.mockReset();

    mocks.fetchUnreadNotificationsCountAction.mockResolvedValue(3);
    mocks.fetchNotificationsAction.mockResolvedValue(makeNotificationsPage([]));
    mocks.markNotificationAsReadAction.mockResolvedValue({ success: true });
    mocks.deleteNotificationAction.mockResolvedValue({ success: true });
    mocks.acceptInvitationNotificationAction.mockResolvedValue({ success: true });
  });

  it("should render the unread badge from the provider without owning a polling interval itself", async () => {
    renderNotificationDropdown();

    expect(screen.getByRole("button", { name: "Notifications" })).toBeVisible();
    // The badge should reflect the count returned by the provider, not a
    // local fetch in the dropdown.
    expect(await screen.findByText("3")).toBeVisible();
    // The dropdown must NOT subscribe to its own polling interval: the
    // provider owns unread-count polling, so we expect a single count fetch
    // when the provider mounts (and no further fetches from the dropdown).
    expect(mocks.fetchUnreadNotificationsCountAction).toHaveBeenCalledTimes(1);
  });

  it("should load notifications and show the empty state when opened", async () => {
    const user = userEvent.setup();
    renderNotificationDropdown();

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    await screen.findByRole("menu");
    await waitFor(() => expect(mocks.fetchNotificationsAction).toHaveBeenCalledWith(0, 5));
    expect(screen.getByText("You have no pending notifications")).toBeVisible();
  });

  it("should render notification items, paginate, and forward mutations through the provider", async () => {
    const user = userEvent.setup();

    // Two pages worth of data, with one unread item on page 0 and one
    // invitation on page 1. The dropdown should expose pagination controls
    // and call into the provider for mutations.
    const page0Item = makeItem({ id: "n-1", status: "UNREAD", title: "Heads up", message: "Plan renewed" });
    const page1Item = makeItem({
      id: "invite-1",
      type: "WORKFORCE_INVITATION",
      status: "UNREAD",
      title: "Join Acme",
      message: "You have been invited",
      targetToken: "tok-1",
    });
    mocks.fetchNotificationsAction.mockImplementation(async (page: number) => {
      if (page === 0) return makeNotificationsPage([page0Item], 0, 2, 2);
      if (page === 1) return makeNotificationsPage([page1Item], 1, 2, 2);
      return makeNotificationsPage([], page, 2, 2);
    });

    renderNotificationDropdown();

    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await screen.findByRole("menu");

    // Page 0: "Heads up" is shown with the unread indicator.
    await waitFor(() => expect(mocks.fetchNotificationsAction).toHaveBeenCalledWith(0, 5));
    expect(screen.getByText("Heads up")).toBeVisible();
    expect(screen.getByText("Plan renewed")).toBeVisible();

    // Forward the read state through the provider and observe the cached
    // page gets trimmed in place (no extra fetch required).
    const row0 = screen.getByText("Heads up").closest("div.group")!;
    await user.click(within(row0).getByRole("button", { name: /Notification actions/i }));
    await user.click(await screen.findByRole("menuitem", { name: "Mark as read" }));

    expect(mocks.markNotificationAsReadAction).toHaveBeenCalledWith("n-1");

    // Paginate to page 1 and accept the invitation through the provider.
    const nextButton = screen.getByRole("button", { name: "Next page" });
    await user.click(nextButton);
    await waitFor(() => expect(mocks.fetchNotificationsAction).toHaveBeenCalledWith(1, 5));

    expect(screen.getByText("Join Acme")).toBeVisible();

    // Stub window.location.reload so we can verify the call without
    // actually reloading jsdom.
    const reloadSpy = vi.fn();
    const originalReload = window.location.reload;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload: reloadSpy },
    });

    try {
      await user.click(screen.getByRole("button", { name: "Accept" }));

      expect(mocks.acceptInvitationNotificationAction).toHaveBeenCalledWith("invite-1", "tok-1");
      // The post-acceptance workspace reload is a UI-level side effect that
      // belongs in the dropdown (the context is UI-agnostic).
      expect(reloadSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: { ...window.location, reload: originalReload },
      });
    }
  });

  it("should delete a notification through the provider when the action menu asks to", async () => {
    const user = userEvent.setup();
    mocks.fetchNotificationsAction.mockResolvedValue(
      makeNotificationsPage([makeItem({ id: "n-del", title: "Delete me", message: "bye" })], 0, 1, 1),
    );

    renderNotificationDropdown();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await screen.findByRole("menu");
    await waitFor(() => expect(screen.getByText("Delete me")).toBeVisible());

    const row = screen.getByText("Delete me").closest("div.group")!;
    await user.click(within(row).getByRole("button", { name: /Notification actions/i }));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(mocks.deleteNotificationAction).toHaveBeenCalledWith("n-del");
  });
});