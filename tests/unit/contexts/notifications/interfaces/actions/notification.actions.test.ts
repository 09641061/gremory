const mocks = vi.hoisted(() => ({
  cookies: { get: vi.fn() },
  queryService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
  },
  createNotificationQueryService: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: vi.fn(() => mocks.cookies) }));
vi.mock("@/contexts/notifications/application/factory", () => ({
  createNotificationQueryService: mocks.createNotificationQueryService,
}));

import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { fetchNotificationsAction, fetchUnreadNotificationsCountAction } from "@/contexts/notifications/interfaces/actions/notification.actions";

describe("Notification server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.cookies.get.mockReturnValue({ value: "access-token" });
    mocks.createNotificationQueryService.mockReturnValue(mocks.queryService);
  });

  it("should return notifications when the query service succeeds", async () => {
    // Arrange
    const notifications = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 5, first: true, last: true };
    mocks.queryService.getNotifications.mockResolvedValue(notifications);

    // Act
    const result = await fetchNotificationsAction(0, 5);

    // Assert
    expect(result).toEqual(notifications);
    expect(mocks.queryService.getNotifications).toHaveBeenCalledWith("access-token", 0, 5);
  });

  it("should return null without logging when notifications are forbidden", async () => {
    // Arrange
    mocks.queryService.getNotifications.mockRejectedValue(new ApiError("Forbidden", 403));

    // Act
    const result = await fetchNotificationsAction(0, 5);

    // Assert
    expect(result).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should return the unread count when the query service succeeds", async () => {
    // Arrange
    mocks.queryService.getUnreadCount.mockResolvedValue(3);

    // Act
    const result = await fetchUnreadNotificationsCountAction();

    // Assert
    expect(result).toBe(3);
    expect(mocks.queryService.getUnreadCount).toHaveBeenCalledWith("access-token");
  });

  it("should return zero without logging when unread count is forbidden", async () => {
    // Arrange
    mocks.queryService.getUnreadCount.mockRejectedValue(new ApiError("Forbidden", 403));

    // Act
    const result = await fetchUnreadNotificationsCountAction();

    // Assert
    expect(result).toBe(0);
    expect(console.error).not.toHaveBeenCalled();
  });
});
