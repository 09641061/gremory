import "server-only";

import {
  AnalyticsApiGateway,
  type AnalyticsQueryParams,
} from "../../../infrastructure/gateways/analytics-api.gateway";
import type { MaxAnalyticsDashboardResponse } from "../../../interfaces/rest/schemas/max-analytics.schemas";

export class GetMaxAnalyticsQueryService {
  async execute(
    query: AnalyticsQueryParams,
    token?: string
  ): Promise<MaxAnalyticsDashboardResponse> {
    return AnalyticsApiGateway.getMaxDashboard(query, token);
  }
}

export function createGetMaxAnalyticsQueryService() {
  return new GetMaxAnalyticsQueryService();
}
