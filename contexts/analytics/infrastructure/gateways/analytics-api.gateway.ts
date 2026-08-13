import "server-only";

import { apiConfig } from "@/api.config";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/domain/model/free-analytics-dashboard";
import type { FreeAnalyticsRepository } from "@/contexts/analytics/domain/services/free-analytics.repository";
import { freeAnalyticsDashboardSchema } from "@/contexts/analytics/interfaces/rest/schemas/free-analytics-dashboard.schema";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export class AnalyticsApiGateway implements FreeAnalyticsRepository {
  async getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboard> {
    const response = await apiClient.get<unknown>(apiConfig.routes.analytics.free, {
      token: accessToken,
      errorMessage: "Failed to fetch free analytics dashboard",
    });

    return freeAnalyticsDashboardSchema.parse(response) as FreeAnalyticsDashboard;
  }
}
