import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsApiGateway } from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AnalyticsApiGateway", () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    expect(String(input)).toBe("http://localhost:8080/api/analytics/free");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer access-token",
    });
    return jsonResponse({
      completedAppointmentsLastSevenDays: 0,
      cancelledAppointmentsLastSevenDays: 0,
      noShowAppointmentsLastSevenDays: 0,
      appointmentsTrend: [],
      appointmentsByMonth: [],
      appointmentsByHour: [],
      completionVsCancellationTrend: [],
      newVsRecurringCustomers: {
        newCustomers: 0,
        recurrentCustomers: 0,
        totalCustomers: 0,
      },
      weeklyRevenueBalance: {
        totalRevenue: 0,
        appointmentsCount: 0,
        averageTicket: 0,
        dailyTrend: [],
      },
      topServicesByRevenue: [],
      topCustomersBySpend: [],
      lostRevenue: {
        cancelledRevenue: 0,
        noShowRevenue: 0,
        totalLostRevenue: 0,
      },
      averageTicket: {
        currentValue: 0,
        lastPeriodValue: 0,
        delta: 0,
      },
      topCustomers: [],
      topServices: [],
      cancellationRateByService: [],
      noShowRateByService: [],
    });
  });

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  it("calls the backend analytics endpoint with the bearer token", async () => {
    const gateway = new AnalyticsApiGateway();
    const result = await gateway.getFreeDashboard("access-token");

    expect(result.completedAppointmentsLastSevenDays).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
