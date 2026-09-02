import { describe, it, expect } from "vitest";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";

describe("NotificationDropdown", () => {
  it("exports NotificationDropdown component correctly", () => {
    expect(NotificationDropdown).toBeDefined();
  });
});
