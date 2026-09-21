import { describe, expect, it } from "vitest";
import { GetStandardAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/get-standard-analytics-query.service";
import type { AnalyticsApiPort } from "@/contexts/analytics/application/ports/analytics-port";
import type { StandardAnalyticsDashboardResponse } from "@/contexts/analytics/application/model/analytics.view-models";

const response: StandardAnalyticsDashboardResponse = {
  from: "2026-01-01",
  to: "2026-01-31",
  establishmentId: "est-1",
  totalAppointments: 1,
  completedAppointments: 1,
  cancelledAppointments: 0,
  noShowAppointments: 0,
  inProgressAppointments: 0,
  confirmedAppointments: 0,
  grossRevenue: 100,
  appointmentsTrend: [],
  topServices: [],
  assistantChatsCount: 0,
  assistantAppointmentsCreatedCount: 0,
  completionVsCancellationTrend: [],
  leadTimeTrend: [],
  cancellationReasons: [],
};

describe("GetStandardAnalyticsQueryService", () => {
  it("should pass the complete query and request context to the reader", async () => {
    const calls: unknown[] = [];
    const reader: AnalyticsApiPort = {
      getStandardDashboard: async (...args) => {
        calls.push(args);
        return response;
      },
      getMaxDashboard: async () => {
        throw new Error("not used");
      },
    };

    const result = await new GetStandardAnalyticsQueryService(reader).execute(
      { organizationId: "org-1", establishmentId: "est-1", from: "2026-01-01", to: "2026-01-31" },
      "token",
      "request-1",
    );

    expect(result).toBe(response);
    expect(calls).toEqual([[{
      organizationId: "org-1",
      establishmentId: "est-1",
      from: "2026-01-01",
      to: "2026-01-31",
    }, "token", "request-1"]]);
  });
});
