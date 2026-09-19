import { z } from "zod";
import {
  analyticsDailyPointSchema,
  analyticsDecimalDailyPointSchema,
  analyticsServiceRankingItemSchema,
} from "./standard-analytics.schemas";

export const analyticsLostRevenueSchema = z
  .object({
    cancelledRevenue: z.number().optional().default(0),
    noShowRevenue: z.number().optional().default(0),
    totalLostRevenue: z.number().optional().default(0),
    cancelledLostRevenue: z.number().optional(),
    noShowLostRevenue: z.number().optional(),
  })
  .transform((data) => ({
    cancelledRevenue: data.cancelledRevenue,
    noShowRevenue: data.noShowRevenue,
    totalLostRevenue: data.totalLostRevenue,
    cancelledLostRevenue: data.cancelledLostRevenue ?? data.cancelledRevenue,
    noShowLostRevenue: data.noShowLostRevenue ?? data.noShowRevenue,
  }));

export const analyticsPeriodComparisonSchema = z
  .object({
    currentRevenue: z.number().optional().default(0),
    previousRevenue: z.number().optional().default(0),
    revenueGrowthPercentage: z.number().optional().default(0),
    currentAppointmentsCount: z.number().optional().default(0),
    previousAppointmentsCount: z.number().optional().default(0),
    appointmentsGrowthPercentage: z.number().optional().default(0),
    currentAverageTicket: z.number().optional().default(0),
    previousAverageTicket: z.number().optional().default(0),
    averageTicketGrowthPercentage: z.number().optional().default(0),
    currentPeriodRevenue: z.number().optional(),
    previousPeriodRevenue: z.number().optional(),
    currentPeriodAppointments: z.number().optional(),
    previousPeriodAppointments: z.number().optional(),
  })
  .transform((data) => ({
    currentRevenue: data.currentRevenue,
    previousRevenue: data.previousRevenue,
    revenueGrowthPercentage: data.revenueGrowthPercentage,
    currentAppointmentsCount: data.currentAppointmentsCount,
    previousAppointmentsCount: data.previousAppointmentsCount,
    appointmentsGrowthPercentage: data.appointmentsGrowthPercentage,
    currentAverageTicket: data.currentAverageTicket,
    previousAverageTicket: data.previousAverageTicket,
    averageTicketGrowthPercentage: data.averageTicketGrowthPercentage,
    currentPeriodRevenue: data.currentPeriodRevenue ?? data.currentRevenue,
    previousPeriodRevenue: data.previousPeriodRevenue ?? data.previousRevenue,
    currentPeriodAppointments: data.currentPeriodAppointments ?? data.currentAppointmentsCount,
    previousPeriodAppointments: data.previousPeriodAppointments ?? data.previousAppointmentsCount,
  }));

export const analyticsServiceFrictionMatrixSchema = z
  .object({
    serviceId: z.string(),
    serviceName: z.string(),
    categoryName: z.string().nullable().optional(),
    appointmentsCount: z.number().optional().default(0),
    totalBookings: z.number().optional(),
    completedCount: z.number().optional().default(0),
    cancelledCount: z.number().optional().default(0),
    noShowCount: z.number().optional().default(0),
    cancellationRate: z.number().optional().default(0),
    noShowRate: z.number().optional().default(0),
    lostRevenue: z.number().optional().default(0),
    hasMinimumVolume: z.boolean().optional(),
  })
  .transform((data) => ({
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    categoryName: data.categoryName ?? null,
    appointmentsCount: data.appointmentsCount,
    totalBookings: data.totalBookings ?? data.appointmentsCount,
    completedCount: data.completedCount,
    cancelledCount: data.cancelledCount,
    noShowCount: data.noShowCount,
    cancellationRate: data.cancellationRate,
    noShowRate: data.noShowRate,
    lostRevenue: data.lostRevenue,
    hasMinimumVolume: data.hasMinimumVolume ?? data.appointmentsCount >= 5,
  }));

export const analyticsWorkforceProductivitySchema = z
  .object({
    employeeId: z.string().optional(),
    workforceMemberId: z.string().optional(),
    employeeName: z.string().optional(),
    memberName: z.string().optional(),
    completedAppointments: z.number().optional().default(0),
    cancelledAppointments: z.number().optional().default(0),
    noShowAppointments: z.number().optional().default(0),
    totalRevenue: z.number().optional().default(0),
    grossRevenue: z.number().optional(),
    completionRate: z.number().optional(),
  })
  .transform((data) => {
    const memberId = data.employeeId ?? data.workforceMemberId ?? "";
    const name = data.employeeName ?? data.memberName ?? "Especialista";
    const total = data.completedAppointments + data.cancelledAppointments + data.noShowAppointments;
    const rate = total > 0 ? (data.completedAppointments / total) * 100 : 0;
    return {
      employeeId: memberId,
      workforceMemberId: memberId,
      employeeName: name,
      memberName: name,
      completedAppointments: data.completedAppointments,
      cancelledAppointments: data.cancelledAppointments,
      noShowAppointments: data.noShowAppointments,
      totalRevenue: data.totalRevenue,
      grossRevenue: data.grossRevenue ?? data.totalRevenue,
      completionRate: data.completionRate ?? rate,
    };
  });

export const analyticsBotRoiSchema = z
  .object({
    totalConversations: z.number().optional().default(0),
    chatsCount: z.number().optional(),
    appointmentsCreated: z.number().optional().default(0),
    appointmentsCreatedCount: z.number().optional(),
    convertedConversations: z.number().optional().default(0),
    conversionRate: z.number().optional().default(0),
    attributedRevenue: z.number().optional().default(0),
    grossRevenueAttributed: z.number().optional(),
  })
  .transform((data) => ({
    totalConversations: data.totalConversations,
    chatsCount: data.chatsCount ?? data.totalConversations,
    appointmentsCreated: data.appointmentsCreated,
    appointmentsCreatedCount: data.appointmentsCreatedCount ?? data.appointmentsCreated,
    convertedConversations: data.convertedConversations,
    conversionRate: data.conversionRate,
    attributedRevenue: data.attributedRevenue,
    grossRevenueAttributed: data.grossRevenueAttributed ?? data.attributedRevenue,
  }));

export const analyticsNewVsRecurringCustomersSchema = z
  .object({
    newCustomers: z.number().optional().default(0),
    newCustomersCount: z.number().optional(),
    recurrentCustomers: z.number().optional().default(0),
    recurringCustomersCount: z.number().optional(),
    totalCustomers: z.number().optional().default(0),
    retentionRate: z.number().optional(),
  })
  .transform((data) => {
    const total = data.totalCustomers;
    const rate = total > 0 ? ((data.recurrentCustomers ?? data.recurringCustomersCount ?? 0) / total) * 100 : 0;
    return {
      newCustomers: data.newCustomers,
      newCustomersCount: data.newCustomersCount ?? data.newCustomers,
      recurrentCustomers: data.recurrentCustomers,
      recurringCustomersCount: data.recurringCustomersCount ?? data.recurrentCustomers,
      totalCustomers: total,
      retentionRate: data.retentionRate ?? rate,
    };
  });

export const analyticsCustomerSpendItemSchema = z
  .object({
    rank: z.number().optional().default(0),
    customerId: z.string(),
    customerName: z.string(),
    totalSpent: z.number().optional().default(0),
    totalSpend: z.number().optional(),
    appointmentsCount: z.number().optional().default(0),
    completedAppointmentsCount: z.number().optional(),
    averageTicket: z.number().optional().default(0),
  })
  .transform((data) => ({
    rank: data.rank,
    customerId: data.customerId,
    customerName: data.customerName,
    totalSpent: data.totalSpent,
    totalSpend: data.totalSpend ?? data.totalSpent,
    appointmentsCount: data.appointmentsCount,
    completedAppointmentsCount: data.completedAppointmentsCount ?? data.appointmentsCount,
    averageTicket: data.averageTicket,
  }));

export const maxAnalyticsDashboardResponseSchema = z.object({
  from: z.string(),
  to: z.string(),
  establishmentId: z.string().nullable().optional(),
  totalAppointments: z.number(),
  completedAppointments: z.number(),
  cancelledAppointments: z.number(),
  noShowAppointments: z.number(),
  inProgressAppointments: z.number(),
  grossRevenue: z.number(),
  appointmentsTrend: z.array(analyticsDailyPointSchema),
  revenueTrend: z.array(analyticsDecimalDailyPointSchema),
  lostRevenue: analyticsLostRevenueSchema,
  periodComparison: analyticsPeriodComparisonSchema,
  topServices: z.array(analyticsServiceRankingItemSchema),
  serviceFrictionMatrix: z.array(analyticsServiceFrictionMatrixSchema),
  workforceProductivity: z.array(analyticsWorkforceProductivitySchema),
  botRoi: analyticsBotRoiSchema,
  customerRetention: analyticsNewVsRecurringCustomersSchema,
  topCustomersBySpend: z.array(analyticsCustomerSpendItemSchema),
});

export type MaxAnalyticsDashboardResponse = z.infer<typeof maxAnalyticsDashboardResponseSchema>;
