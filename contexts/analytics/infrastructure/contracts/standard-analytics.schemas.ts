import { z } from "zod";

export const analyticsDailyPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const analyticsDecimalDailyPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const analyticsDailyComparisonPointSchema = z
  .object({
    date: z.string(),
    completed: z.number().optional().default(0),
    cancelled: z.number().optional().default(0),
    primaryValue: z.number().optional(),
    secondaryValue: z.number().optional(),
  })
  .transform((data) => ({
    date: data.date,
    completed: data.completed ?? data.primaryValue ?? 0,
    cancelled: data.cancelled ?? data.secondaryValue ?? 0,
    primaryValue: data.primaryValue ?? data.completed ?? 0,
    secondaryValue: data.secondaryValue ?? data.cancelled ?? 0,
  }));

export const analyticsServiceRankingItemSchema = z
  .object({
    rank: z.number().optional(),
    serviceId: z.string(),
    serviceName: z.string(),
    categoryName: z.string().nullable().optional(),
    completedCount: z.number().optional(),
    completedAppointmentsCount: z.number().optional(),
    appointmentsCount: z.number().optional(),
    cancelledAppointmentsCount: z.number().optional(),
    noShowAppointmentsCount: z.number().optional(),
    grossRevenue: z.number().optional(),
    totalRevenue: z.number().optional(),
    lastBookedAt: z.string().nullable().optional(),
  })
  .transform((data) => ({
    rank: data.rank ?? 1,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    categoryName: data.categoryName ?? null,
    completedCount: data.completedCount ?? data.completedAppointmentsCount ?? data.appointmentsCount ?? 0,
    completedAppointmentsCount: data.completedAppointmentsCount ?? data.completedCount ?? 0,
    appointmentsCount: data.appointmentsCount ?? data.completedCount ?? 0,
    cancelledAppointmentsCount: data.cancelledAppointmentsCount ?? 0,
    noShowAppointmentsCount: data.noShowAppointmentsCount ?? 0,
    grossRevenue: data.grossRevenue ?? data.totalRevenue ?? 0,
    lastBookedAt: data.lastBookedAt ?? null,
  }));

export const analyticsCancellationReasonItemSchema = z.object({
  reason: z.string(),
  count: z.number(),
  percentage: z.number(),
});

export const standardAnalyticsDashboardResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  establishmentId: z.string().nullable().optional(),
  totalAppointments: z.number(),
  completedAppointments: z.number(),
  cancelledAppointments: z.number(),
  noShowAppointments: z.number(),
  inProgressAppointments: z.number(),
  confirmedAppointments: z.number().optional().default(0),
  grossRevenue: z.number(),
  appointmentsTrend: z.array(analyticsDailyPointSchema),
  topServices: z.array(analyticsServiceRankingItemSchema),
  assistantChatsCount: z.number().optional().default(0),
  assistantAppointmentsCreatedCount: z.number().optional().default(0),
  completionVsCancellationTrend: z.array(analyticsDailyComparisonPointSchema),
  leadTimeTrend: z.array(analyticsDecimalDailyPointSchema),
  cancellationReasons: z.array(analyticsCancellationReasonItemSchema),
});

export type StandardAnalyticsDashboardResponse = z.infer<typeof standardAnalyticsDashboardResponseSchema>;
