import type { FreeAnalyticsDashboard } from "@/contexts/analytics/domain/model/free-analytics-dashboard";

export interface FreeAnalyticsRepository {
  getFreeDashboard(accessToken: string): Promise<FreeAnalyticsDashboard>;
}
