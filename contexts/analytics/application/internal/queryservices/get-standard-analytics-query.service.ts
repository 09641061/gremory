import "server-only";

import {
  AnalyticsApiGateway,
  type AnalyticsQueryParams,
} from "../../../infrastructure/gateways/analytics-api.gateway";
import type { StandardAnalyticsDashboardResponse } from "../../../infrastructure/contracts/standard-analytics.schemas";

export class GetStandardAnalyticsQueryService {
  async execute(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<StandardAnalyticsDashboardResponse> {
    return AnalyticsApiGateway.getStandardDashboard(query, token, correlationId);
  }
}

export function createGetStandardAnalyticsQueryService() {
  return new GetStandardAnalyticsQueryService();
}
