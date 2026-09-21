import {
  deleteNotificationResponseSchema,
  notificationSchema,
  writeAckResponseSchema,
} from "@/contexts/notifications/infrastructure/contracts/notifications.schemas";

describe("notification provider response schemas", () => {
  it("accepts explicit action/state while retaining legacy response compatibility", () => {
    const parsed = notificationSchema.parse({
      id: "n-1",
      userId: "u-1",
      type: "WORKFORCE_INVITATION",
      title: "Invitation",
      message: "Join",
      status: "UNREAD",
      createdAt: "2026-01-01T00:00:00Z",
      action: "ACCEPT_INVITATION",
      state: "PENDING",
    });

    expect(parsed.action).toBe("ACCEPT_INVITATION");
    expect(parsed.state).toBe("PENDING");
  });

  it.each([undefined, {}, { success: true }])("accepts provider write acknowledgement %j", (response) => {
    expect(writeAckResponseSchema.parse(response)).toEqual(response);
    expect(deleteNotificationResponseSchema.parse(response)).toEqual(response);
  });

  it("rejects malformed write acknowledgements", () => {
    expect(() => writeAckResponseSchema.parse({ success: "yes" })).toThrow();
  });
});
