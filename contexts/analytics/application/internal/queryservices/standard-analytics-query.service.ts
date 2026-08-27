import type { GetStandardAnalyticsQuery } from "@/contexts/analytics/domain/model/queries/get-standard-analytics.query";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { AnalyticsApiGateway } from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

export async function getStandardAnalyticsDashboard(
  query: GetStandardAnalyticsQuery,
): Promise<StandardAnalyticsDashboard> {
  if (!query.accessToken) {
    throw new Error("Authentication required");
  }
  return new AnalyticsApiGateway().getStandardDashboard(query.accessToken, query);
}
