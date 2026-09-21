import "server-only";

import {
  AnalyticsApiGateway,
  type AnalyticsQueryParams,
} from "../../../infrastructure/gateways/analytics-api.gateway";
import type { MaxAnalyticsDashboardResponse } from "../../../infrastructure/contracts/max-analytics.schemas";

export class GetMaxAnalyticsQueryService {
  async execute(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<MaxAnalyticsDashboardResponse> {
    return AnalyticsApiGateway.getMaxDashboard(query, token, correlationId);
  }
}

export function createGetMaxAnalyticsQueryService() {
  return new GetMaxAnalyticsQueryService();
}
