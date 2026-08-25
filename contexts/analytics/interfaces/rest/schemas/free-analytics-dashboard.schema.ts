import { z } from "zod";

export const analyticsTrendPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const analyticsCategoryPointSchema = z.object({
  label: z.string(),
  value: z.number(),
});

export const analyticsRankingCustomerItemSchema = z.object({
  rank: z.number(),
  customerId: z.string(),
  customerName: z.string(),
  appointmentsCount: z.number(),
  completedAppointmentsCount: z.number(),
  cancelledAppointmentsCount: z.number(),
  noShowAppointmentsCount: z.number(),
  lastAppointmentAt: z.string(),
});

export const analyticsRankingServiceItemSchema = z.object({
  rank: z.number(),
  serviceId: z.string(),
  serviceName: z.string(),
  appointmentsCount: z.number(),
  completedAppointmentsCount: z.number(),
  cancelledAppointmentsCount: z.number(),
  noShowAppointmentsCount: z.number(),
  lastBookedAt: z.string(),
});

export const analyticsServiceRateItemSchema = z.object({
  rank: z.number(),
  serviceId: z.string(),
  serviceName: z.string(),
  appointmentsCount: z.number(),
  affectedCount: z.number(),
  rate: z.number(),
  lastAppointmentAt: z.string(),
});

export const analyticsCustomerMixSchema = z.object({
  newCustomers: z.number(),
  recurrentCustomers: z.number(),
  totalCustomers: z.number(),
});

export const analyticsWeeklyRevenueBalanceSchema = z.object({
  totalRevenue: z.number(),
  appointmentsCount: z.number(),
  averageTicket: z.number(),
  dailyTrend: z.array(analyticsTrendPointSchema),
});

export const analyticsRevenueServiceItemSchema = z.object({
  rank: z.number(),
  serviceId: z.string(),
  serviceName: z.string(),
  revenue: z.number(),
  appointmentsCount: z.number(),
  averagePrice: z.number(),
});

export const analyticsRevenueCustomerItemSchema = z.object({
  rank: z.number(),
  customerId: z.string(),
  customerName: z.string(),
  totalSpent: z.number(),
  appointmentsCount: z.number(),
  averageTicket: z.number(),
});

export const analyticsLostRevenueSchema = z.object({
  cancelledRevenue: z.number(),
  noShowRevenue: z.number(),
  totalLostRevenue: z.number(),
});

export const analyticsAverageTicketSchema = z.object({
  currentValue: z.number(),
  lastPeriodValue: z.number(),
  delta: z.number(),
});

export const freeAnalyticsDashboardSchema = z.object({
  completedAppointmentsLastSevenDays: z.number(),
  cancelledAppointmentsLastSevenDays: z.number(),
  noShowAppointmentsLastSevenDays: z.number(),
  appointmentsTrend: z.array(analyticsTrendPointSchema),
  appointmentsByHour: z.array(analyticsCategoryPointSchema),
  newVsRecurringCustomers: analyticsCustomerMixSchema,
  weeklyRevenueBalance: analyticsWeeklyRevenueBalanceSchema,
  topServicesByRevenue: z.array(analyticsRevenueServiceItemSchema),
  topCustomersBySpend: z.array(analyticsRevenueCustomerItemSchema),
  lostRevenue: analyticsLostRevenueSchema,
  averageTicket: analyticsAverageTicketSchema,
  topCustomers: z.array(analyticsRankingCustomerItemSchema),
  topServices: z.array(analyticsRankingServiceItemSchema),
  cancellationRateByService: z.array(analyticsServiceRateItemSchema),
  noShowRateByService: z.array(analyticsServiceRateItemSchema),
});

export const standardAnalyticsDashboardSchema = freeAnalyticsDashboardSchema
  .omit({
    completedAppointmentsLastSevenDays: true,
    cancelledAppointmentsLastSevenDays: true,
    noShowAppointmentsLastSevenDays: true,
  })
  .extend({
    from: z.string(),
    to: z.string(),
    assistantCreatedAppointments: z.number(),
    assistantChats: z.number(),
    assistantConvertedChats: z.number(),
    assistantConversionRate: z.number(),
    completedAppointments: z.number(),
    cancelledAppointments: z.number(),
    noShowAppointments: z.number(),
    completionVsCancellationTrend: z.array(z.object({
      date: z.string(),
      completed: z.number(),
      cancelled: z.number(),
    })),
    leadTimeTrend: z.array(analyticsTrendPointSchema),
    cancellationReasons: z.array(z.object({
      rank: z.number(),
      reason: z.string(),
      cancellationsCount: z.number(),
      rate: z.number(),
    })),
  });
