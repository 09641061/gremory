/** Application-owned read models for the remote Analytics feature. */

export type AnalyticsDailyPoint = {
  date: string;
  value: number;
};

export type AnalyticsDecimalDailyPoint = {
  date: string;
  value: number;
};

export type AnalyticsDailyComparisonPoint = {
  date: string;
  completed: number;
  cancelled: number;
  primaryValue: number;
  secondaryValue: number;
};

export type AnalyticsServiceRankingItem = {
  rank: number;
  serviceId: string;
  serviceName: string;
  categoryName: string | null;
  completedCount: number;
  completedAppointmentsCount: number;
  appointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  grossRevenue: number;
  lastBookedAt: string | null;
};

export type AnalyticsCancellationReasonItem = {
  reason: string;
  count: number;
  percentage: number;
};

export type AnalyticsStandardDashboard = {
  from: string;
  to: string;
  establishmentId?: string | null;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  inProgressAppointments: number;
  confirmedAppointments: number;
  grossRevenue: number;
  appointmentsTrend: AnalyticsDailyPoint[];
  topServices: AnalyticsServiceRankingItem[];
  assistantChatsCount: number;
  assistantAppointmentsCreatedCount: number;
  completionVsCancellationTrend: AnalyticsDailyComparisonPoint[];
  leadTimeTrend: AnalyticsDecimalDailyPoint[];
  cancellationReasons: AnalyticsCancellationReasonItem[];
};

export type AnalyticsLostRevenue = {
  cancelledRevenue: number;
  noShowRevenue: number;
  totalLostRevenue: number;
  cancelledLostRevenue: number;
  noShowLostRevenue: number;
};

export type AnalyticsPeriodComparison = {
  currentRevenue: number;
  previousRevenue: number;
  revenueGrowthPercentage: number;
  currentAppointmentsCount: number;
  previousAppointmentsCount: number;
  appointmentsGrowthPercentage: number;
  currentAverageTicket: number;
  previousAverageTicket: number;
  averageTicketGrowthPercentage: number;
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  currentPeriodAppointments: number;
  previousPeriodAppointments: number;
};

export type AnalyticsServiceFrictionRow = {
  serviceId: string;
  serviceName: string;
  categoryName: string | null;
  appointmentsCount: number;
  totalBookings: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  cancellationRate: number;
  noShowRate: number;
  lostRevenue: number;
  hasMinimumVolume: boolean;
};

export type AnalyticsWorkforceProductivityRow = {
  employeeId: string;
  workforceMemberId: string;
  employeeName: string;
  memberName: string;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalRevenue: number;
  grossRevenue: number;
  completionRate: number;
};

export type AnalyticsBotRoi = {
  totalConversations: number;
  chatsCount: number;
  appointmentsCreated: number;
  appointmentsCreatedCount: number;
  convertedConversations: number;
  conversionRate: number;
  attributedRevenue: number;
  grossRevenueAttributed: number;
};

export type AnalyticsCustomerRetention = {
  newCustomers: number;
  newCustomersCount: number;
  recurrentCustomers: number;
  recurringCustomersCount: number;
  totalCustomers: number;
  retentionRate: number;
};

export type AnalyticsCustomerSpendRow = {
  rank: number;
  customerId: string;
  customerName: string;
  totalSpent: number;
  totalSpend: number;
  appointmentsCount: number;
  completedAppointmentsCount: number;
  averageTicket: number;
};

export type AnalyticsMaxDashboard = {
  from: string;
  to: string;
  establishmentId?: string | null;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  inProgressAppointments: number;
  grossRevenue: number;
  appointmentsTrend: AnalyticsDailyPoint[];
  revenueTrend: AnalyticsDecimalDailyPoint[];
  lostRevenue: AnalyticsLostRevenue;
  periodComparison: AnalyticsPeriodComparison;
  topServices: AnalyticsServiceRankingItem[];
  serviceFrictionMatrix: AnalyticsServiceFrictionRow[];
  workforceProductivity: AnalyticsWorkforceProductivityRow[];
  botRoi: AnalyticsBotRoi;
  customerRetention: AnalyticsCustomerRetention;
  topCustomersBySpend: AnalyticsCustomerSpendRow[];
};

export type StandardAnalyticsDashboardResponse = AnalyticsStandardDashboard;
export type MaxAnalyticsDashboardResponse = AnalyticsMaxDashboard;

export type AnalyticsQueryParams = Readonly<{
  organizationId: string;
  establishmentId?: string;
  from: string;
  to: string;
}>;
