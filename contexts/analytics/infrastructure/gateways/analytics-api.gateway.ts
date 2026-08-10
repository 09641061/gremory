import "server-only";

import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export interface AnalyticsTrendPoint {
  date: string;
  value: number;
}

export interface FreeAnalyticsDashboardResponse {
  ownerId: string;
  organizationId: string | null;
  organizationName: string | null;
  hasOrganization: boolean;
  establishmentsCount: number;
  activeEstablishmentsCount: number;
  customersCount: number;
  activeCustomersCount: number;
  activeServicesCount: number;
  activeMembersCount: number;
  appointmentsToday: number;
  appointmentsLastSevenDays: number;
  completedAppointmentsLastSevenDays: number;
  cancelledAppointmentsLastSevenDays: number;
  noShowAppointmentsLastSevenDays: number;
  inProgressAppointmentsLastSevenDays: number;
  assistantChatsLastSevenDays: number;
  assistantMessagesLastSevenDays: number;
  appointmentsTrend: AnalyticsTrendPoint[];
  customersTrend: AnalyticsTrendPoint[];
  assistantMessagesTrend: AnalyticsTrendPoint[];
  generatedAt: string;
}

export class AnalyticsApiGateway {
  async getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboardResponse> {
    return apiClient.get<FreeAnalyticsDashboardResponse>(apiConfig.routes.analytics.free, {
      token: accessToken,
      errorMessage: "Failed to fetch free analytics dashboard",
    });
  }
}

