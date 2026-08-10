import "server-only";

import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export interface AnalyticsTrendPoint {
  date: string;
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

export interface FreeAnalyticsDashboardResponse {
  hasOrganization: boolean;
  completedAppointmentsLastSevenDays: number;
  cancelledAppointmentsLastSevenDays: number;
  noShowAppointmentsLastSevenDays: number;
  inProgressAppointmentsLastSevenDays: number;
  appointmentsTrend: AnalyticsTrendPoint[];
  topCustomers: AnalyticsRankingCustomerItem[];
  topServices: AnalyticsRankingServiceItem[];
}

export class AnalyticsApiGateway {
  async getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboardResponse> {
    return apiClient.get<FreeAnalyticsDashboardResponse>(apiConfig.routes.analytics.free, {
      token: accessToken,
      errorMessage: "Failed to fetch free analytics dashboard",
    });
  }
}
