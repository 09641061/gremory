import { beforeEach, describe, expect, it, vi } from "vitest";

import { freeAnalyticsRoute } from "@/contexts/analytics/interfaces/rest/routes/analytics.route";

const mocks = vi.hoisted(() => ({
  handle: vi.fn(),
}));

vi.mock("@/contexts/analytics/application/internal/queryservices/free-analytics-query.service", () => ({
  createFreeAnalyticsQueryService: () => ({
    handle: mocks.handle,
  }),
}));

describe("freeAnalyticsRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.handle.mockResolvedValue({
      ownerId: "11111111-1111-4111-8111-111111111111",
      organizationId: null,
      organizationName: null,
      hasOrganization: false,
      establishmentsCount: 0,
      activeEstablishmentsCount: 0,
      customersCount: 0,
      activeCustomersCount: 0,
      activeServicesCount: 0,
      activeMembersCount: 0,
      appointmentsToday: 0,
      appointmentsLastSevenDays: 0,
      completedAppointmentsLastSevenDays: 0,
      cancelledAppointmentsLastSevenDays: 0,
      noShowAppointmentsLastSevenDays: 0,
      inProgressAppointmentsLastSevenDays: 0,
      assistantChatsLastSevenDays: 0,
      assistantMessagesLastSevenDays: 0,
      appointmentsTrend: [],
      customersTrend: [],
      assistantMessagesTrend: [],
      generatedAt: "2026-08-10T15:30:00Z",
    });
  });

  it("returns the analytics snapshot from the query service", async () => {
    const response = await freeAnalyticsRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      ownerId: "11111111-1111-4111-8111-111111111111",
      hasOrganization: false,
    });
    expect(mocks.handle).toHaveBeenCalledTimes(1);
  });
});
