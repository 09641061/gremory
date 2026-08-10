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

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  it("calls the backend analytics endpoint with the bearer token", async () => {
    const gateway = new AnalyticsApiGateway();
    const result = await gateway.getFreeDashboard("access-token");

    expect(result.ownerId).toBe("11111111-1111-4111-8111-111111111111");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

