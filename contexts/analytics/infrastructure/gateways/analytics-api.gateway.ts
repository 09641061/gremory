import "server-only";

import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export interface AnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface AnalyticsCategoryPoint {
  label: string;
  value: number;
}

export interface AnalyticsDualTrendPoint {
  date: string;
  completed: number;
  cancelled: number;
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

export interface FreeAnalyticsDashboardResponse {
  completedAppointmentsLastSevenDays: number;
  cancelledAppointmentsLastSevenDays: number;
  noShowAppointmentsLastSevenDays: number;
  appointmentsTrend: AnalyticsTrendPoint[];
  appointmentsByMonth: AnalyticsCategoryPoint[];
  appointmentsByHour: AnalyticsCategoryPoint[];
  completionVsCancellationTrend: AnalyticsDualTrendPoint[];
  newVsRecurringCustomers: AnalyticsCustomerMix;
  topCustomers: AnalyticsRankingCustomerItem[];
  topServices: AnalyticsRankingServiceItem[];
  cancellationRateByService: AnalyticsServiceRateItem[];
  noShowRateByService: AnalyticsServiceRateItem[];
}

export class AnalyticsApiGateway {
  async getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboardResponse> {
    return apiClient.get<FreeAnalyticsDashboardResponse>(apiConfig.routes.analytics.free, {
      token: accessToken,
      errorMessage: "Failed to fetch free analytics dashboard",
    });
  }
}
