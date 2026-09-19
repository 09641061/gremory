import "server-only";

import {
  AnalyticsApiGateway,
  type AnalyticsQueryParams,
} from "../../../infrastructure/gateways/analytics-api.gateway";
import type { StandardAnalyticsDashboardResponse } from "../../../interfaces/rest/schemas/standard-analytics.schemas";

export class GetStandardAnalyticsQueryService {
  async execute(
    query: AnalyticsQueryParams,
    token?: string
  ): Promise<StandardAnalyticsDashboardResponse> {
    return AnalyticsApiGateway.getStandardDashboard(query, token);
  }
}

export function createGetStandardAnalyticsQueryService() {
  return new GetStandardAnalyticsQueryService();
}
