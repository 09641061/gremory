import { describe, it, expect } from "vitest";
import { AnalyticsDateRange } from "@/contexts/analytics/domain/model/value-objects/analytics-date-range";
import { AnalyticsExportService } from "@/contexts/analytics/domain/services/analytics-export.service";
import { standardAnalyticsDashboardResponseSchema } from "@/contexts/analytics/infrastructure/contracts/standard-analytics.schemas";
import { maxAnalyticsDashboardResponseSchema } from "@/contexts/analytics/infrastructure/contracts/max-analytics.schemas";

describe("AnalyticsDateRange", () => {
  it("should create valid date range when from <= to", () => {
    const range = AnalyticsDateRange.create("2026-01-01", "2026-01-31");
    expect(range.from).toBe("2026-01-01");
    expect(range.to).toBe("2026-01-31");
  });

  it("should throw error when from > to", () => {
    expect(() => AnalyticsDateRange.create("2026-02-01", "2026-01-01")).toThrow(
      "The 'from' date must be before or equal to the 'to' date."
    );
  });

  it("should generate proper dates for presets", () => {
    const range30d = AnalyticsDateRange.fromPreset("30d", 30);
    expect(range30d.from).toBeDefined();
    expect(range30d.to).toBeDefined();
    expect(new Date(range30d.from).getTime()).toBeLessThanOrEqual(new Date(range30d.to).getTime());
  });
});

describe("AnalyticsExportService", () => {
  it("should format CSV with UTF-8 BOM and escaped quotes", () => {
    const headers = ["ID", "Name, Title", "Amount"];
    const rows = [
      ["1", 'Special "Cut"', 150.5],
      ["2", "Standard Service", null],
    ];

    const csv = AnalyticsExportService.toCsvWithBom(headers, rows);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"Name, Title"');
    expect(csv).toContain('"Special ""Cut"""');
    expect(csv).toContain('""');
  });
});

describe("Analytics Schemas Validation", () => {
  it("should validate standard analytics dashboard payload", () => {
    const mockStandardPayload = {
      from: "2026-01-01",
      to: "2026-01-31",
      establishmentId: "123e4567-e89b-12d3-a456-426614174000",
      totalAppointments: 100,
      completedAppointments: 80,
      cancelledAppointments: 15,
      noShowAppointments: 5,
      inProgressAppointments: 0,
      confirmedAppointments: 0,
      grossRevenue: 5000,
      appointmentsTrend: [{ date: "2026-01-01", value: 5 }],
      topServices: [
        {
          serviceId: "srv-1",
          serviceName: "Haircut",
          categoryName: "Hair",
          completedCount: 50,
          grossRevenue: 2500,
        },
      ],
      assistantChatsCount: 40,
      assistantAppointmentsCreatedCount: 20,
      completionVsCancellationTrend: [
        { date: "2026-01-01", primaryValue: 4, secondaryValue: 1 },
      ],
      leadTimeTrend: [{ date: "2026-01-01", value: 2.5 }],
      cancellationReasons: [{ reason: "Cliente reprogramó", count: 10, percentage: 66.6 }],
    };

    const parsed = standardAnalyticsDashboardResponseSchema.parse(mockStandardPayload);
    expect(parsed.totalAppointments).toBe(100);
    expect(parsed.topServices).toHaveLength(1);
  });

  it("should validate standard analytics with backend DTO topServices fields", () => {
    const mockBackendPayload = {
      from: "2026-01-01",
      to: "2026-01-31",
      totalAppointments: 1,
      completedAppointments: 1,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      inProgressAppointments: 0,
      grossRevenue: 50,
      appointmentsTrend: [],
      topServices: [
        {
          rank: 1,
          serviceId: "123e4567-e89b-12d3-a456-426614174000",
          serviceName: "Corte de Cabello",
          appointmentsCount: 1,
          completedAppointmentsCount: 1,
          cancelledAppointmentsCount: 0,
          noShowAppointmentsCount: 0,
          lastBookedAt: "2026-09-16T19:03:13Z",
        },
      ],
      completionVsCancellationTrend: [],
      leadTimeTrend: [],
      cancellationReasons: [],
    };

    const parsed = standardAnalyticsDashboardResponseSchema.parse(mockBackendPayload);
    expect(parsed.topServices[0].completedCount).toBe(1);
    expect(parsed.topServices[0].grossRevenue).toBe(0);
    expect(parsed.topServices[0].serviceName).toBe("Corte de Cabello");
  });

  it("should validate max analytics dashboard payload", () => {
    const mockMaxPayload = {
      from: "2026-01-01",
      to: "2026-01-31",
      establishmentId: "123e4567-e89b-12d3-a456-426614174000",
      totalAppointments: 100,
      completedAppointments: 80,
      cancelledAppointments: 15,
      noShowAppointments: 5,
      inProgressAppointments: 0,
      grossRevenue: 5000,
      appointmentsTrend: [{ date: "2026-01-01", value: 5 }],
      revenueTrend: [{ date: "2026-01-01", value: 250 }],
      lostRevenue: {
        totalLostRevenue: 1000,
        cancelledLostRevenue: 750,
        noShowLostRevenue: 250,
      },
      periodComparison: {
        currentPeriodRevenue: 5000,
        previousPeriodRevenue: 4000,
        revenueGrowthPercentage: 25.0,
        currentPeriodAppointments: 100,
        previousPeriodAppointments: 90,
        appointmentsGrowthPercentage: 11.1,
      },
      topServices: [],
      serviceFrictionMatrix: [
        {
          serviceId: "srv-1",
          serviceName: "Coloración",
          categoryName: "Peluquería",
          totalBookings: 20,
          cancellationRate: 30.0,
          noShowRate: 10.0,
          hasMinimumVolume: true,
        },
      ],
      workforceProductivity: [
        {
          workforceMemberId: "wf-1",
          memberName: "Ana Especialista",
          completedAppointments: 40,
          cancelledAppointments: 5,
          grossRevenue: 3000,
          completionRate: 88.8,
        },
      ],
      botRoi: {
        chatsCount: 60,
        appointmentsCreatedCount: 30,
        conversionRate: 50.0,
        grossRevenueAttributed: 2000,
      },
      customerRetention: {
        newCustomersCount: 20,
        recurringCustomersCount: 40,
        retentionRate: 66.6,
      },
      topCustomersBySpend: [
        {
          customerId: "cust-1",
          customerName: "Carlos Cliente",
          totalSpend: 800,
          completedAppointmentsCount: 4,
        },
      ],
    };

    const parsed = maxAnalyticsDashboardResponseSchema.parse(mockMaxPayload);
    expect(parsed.lostRevenue.totalLostRevenue).toBe(1000);
    expect(parsed.serviceFrictionMatrix[0].hasMinimumVolume).toBe(true);
  });
});