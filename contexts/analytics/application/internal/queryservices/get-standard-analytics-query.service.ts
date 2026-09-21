import type { AnalyticsApiPort } from "../../ports/analytics-port";
import type {
  AnalyticsQueryParams,
  StandardAnalyticsDashboardResponse,
} from "../../model/analytics.view-models";

export class GetStandardAnalyticsQueryService {
  constructor(private readonly gateway: AnalyticsApiPort) {}

  async execute(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<StandardAnalyticsDashboardResponse> {
    return this.gateway.getStandardDashboard(query, token, correlationId);
  }
}

export function createGetStandardAnalyticsQueryService(
  gateway: AnalyticsApiPort,
): GetStandardAnalyticsQueryService {
  return new GetStandardAnalyticsQueryService(gateway);
}
