export interface AnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface AnalyticsCategoryPoint {
  label: string;
  value: number;
}

export interface AnalyticsRankingCustomerItem {
  rank: number;
  customerId: string;
  customerName: string;
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  lastAppointmentAt: string;
}

export interface AnalyticsRankingServiceItem {
  rank: number;
  serviceId: string;
  serviceName: string;
  appointmentsCount: number;
  completedAppointmentsCount: number;
  cancelledAppointmentsCount: number;
  noShowAppointmentsCount: number;
  lastBookedAt: string;
}

export interface AnalyticsServiceRateItem {
  rank: number;
  serviceId: string;
  serviceName: string;
  appointmentsCount: number;
  affectedCount: number;
  rate: number;
  lastAppointmentAt: string;
}

export interface AnalyticsCustomerMix {
  newCustomers: number;
  recurrentCustomers: number;
  totalCustomers: number;
}

export interface AnalyticsWeeklyRevenueBalance {
  totalRevenue: number;
  appointmentsCount: number;
  averageTicket: number;
  dailyTrend: AnalyticsTrendPoint[];
}

export interface AnalyticsRevenueServiceItem {
  rank: number;
  serviceId: string;
  serviceName: string;
  revenue: number;
  appointmentsCount: number;
  averagePrice: number;
}

export interface AnalyticsRevenueCustomerItem {
  rank: number;
  customerId: string;
  customerName: string;
  totalSpent: number;
  appointmentsCount: number;
  averageTicket: number;
}

export interface AnalyticsLostRevenue {
  cancelledRevenue: number;
  noShowRevenue: number;
  totalLostRevenue: number;
}

export interface AnalyticsAverageTicket {
  currentValue: number;
  lastPeriodValue: number;
  delta: number;
}

export interface FreeAnalyticsDashboard {
  completedAppointmentsLastSevenDays: number;
  cancelledAppointmentsLastSevenDays: number;
  noShowAppointmentsLastSevenDays: number;
  appointmentsTrend: AnalyticsTrendPoint[];
  appointmentsByHour: AnalyticsCategoryPoint[];
  newVsRecurringCustomers: AnalyticsCustomerMix;
  weeklyRevenueBalance: AnalyticsWeeklyRevenueBalance;
  topServicesByRevenue: AnalyticsRevenueServiceItem[];
  topCustomersBySpend: AnalyticsRevenueCustomerItem[];
  lostRevenue: AnalyticsLostRevenue;
  averageTicket: AnalyticsAverageTicket;
  topCustomers: AnalyticsRankingCustomerItem[];
  topServices: AnalyticsRankingServiceItem[];
  cancellationRateByService: AnalyticsServiceRateItem[];
  noShowRateByService: AnalyticsServiceRateItem[];
}
