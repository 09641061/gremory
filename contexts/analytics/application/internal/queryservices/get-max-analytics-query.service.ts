import type { AnalyticsApiPort } from "../../ports/analytics-port";
import type {
  AnalyticsQueryParams,
  MaxAnalyticsDashboardResponse,
} from "../../model/analytics.view-models";

export class GetMaxAnalyticsQueryService {
  constructor(private readonly gateway: AnalyticsApiPort) {}

  async execute(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<MaxAnalyticsDashboardResponse> {
    return this.gateway.getMaxDashboard(query, token, correlationId);
  }
}

export function createGetMaxAnalyticsQueryService(
  gateway: AnalyticsApiPort,
): GetMaxAnalyticsQueryService {
  return new GetMaxAnalyticsQueryService(gateway);
}
