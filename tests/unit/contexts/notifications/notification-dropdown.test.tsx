/** @vitest-environment jsdom */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  fetchNotificationsAction: vi.fn().mockResolvedValue({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 5,
    first: true,
    last: true,
  }),
  fetchUnreadNotificationsCountAction: vi.fn().mockResolvedValue(3),
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

import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";

function renderNotificationDropdown() {
  return render(<NotificationDropdown />);
}

describe("NotificationDropdown", () => {
  beforeEach(() => {
    mocks.fetchNotificationsAction.mockClear();
    mocks.fetchUnreadNotificationsCountAction.mockClear();
    mocks.markNotificationAsReadAction.mockClear();
    mocks.deleteNotificationAction.mockClear();
    mocks.acceptInvitationNotificationAction.mockClear();
  });

  it("should render a notifications button with the unread count badge on mount", async () => {
    renderNotificationDropdown();

    expect(screen.getByRole("button", { name: "Notifications" })).toBeVisible();
    expect(await screen.findByText("3")).toBeVisible();
  });

  it("should load notifications and show the empty state when opened", async () => {
    const user = userEvent.setup();
    renderNotificationDropdown();

    await user.click(screen.getByRole("button", { name: "Notifications" }));

    await screen.findByRole("menu");
    await waitFor(() => expect(mocks.fetchNotificationsAction).toHaveBeenCalledWith(0, 5));
    expect(screen.getByText("You have no pending notifications")).toBeVisible();
  });
});
