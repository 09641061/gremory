import "server-only";

import { apiConfig } from "@/api.config";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/domain/model/free-analytics-dashboard";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import type { FreeAnalyticsRepository } from "@/contexts/analytics/domain/services/free-analytics.repository";
import {
  freeAnalyticsDashboardSchema,
  standardAnalyticsDashboardSchema,
} from "@/contexts/analytics/interfaces/rest/schemas/free-analytics-dashboard.schema";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export class AnalyticsApiGateway implements FreeAnalyticsRepository {
  async getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboard> {
    const response = await apiClient.get<unknown>(apiConfig.routes.analytics.free, {
      token: accessToken,
      errorMessage: "Failed to fetch free analytics dashboard",
    });

    return freeAnalyticsDashboardSchema.parse(response) as FreeAnalyticsDashboard;
  }

  async getStandardDashboard(
    accessToken: string,
    range?: { from?: string; to?: string },
  ): Promise<StandardAnalyticsDashboard> {
    const params = new URLSearchParams();
    if (range?.from) params.set("from", range.from);
    if (range?.to) params.set("to", range.to);
    const path = params.size > 0 ? `${apiConfig.routes.analytics.standard}?${params}` : apiConfig.routes.analytics.standard;
    const response = await apiClient.get<unknown>(path, {
      token: accessToken,
      errorMessage: "Failed to fetch standard analytics dashboard",
    });
    return standardAnalyticsDashboardSchema.parse(response) as StandardAnalyticsDashboard;
  }
}
