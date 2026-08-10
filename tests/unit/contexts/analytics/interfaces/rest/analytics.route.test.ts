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
      completedAppointmentsLastSevenDays: 0,
      cancelledAppointmentsLastSevenDays: 0,
      noShowAppointmentsLastSevenDays: 0,
      appointmentsTrend: [],
      topCustomers: [],
      topServices: [],
    });
  });

  it("returns the analytics snapshot from the query service", async () => {
    const response = await freeAnalyticsRoute();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({});
    expect(mocks.handle).toHaveBeenCalledTimes(1);
  });
});
