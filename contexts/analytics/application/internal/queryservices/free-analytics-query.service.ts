import "server-only";

import type { FreeAnalyticsQueryService } from "@/contexts/analytics/application/services/free-analytics-query.service";
import type {
  FreeAnalyticsDashboard,
} from "@/contexts/analytics/domain/model/free-analytics-dashboard";
import type { GetFreeAnalyticsQuery } from "@/contexts/analytics/domain/model/queries/get-free-analytics.query";
import type { FreeAnalyticsRepository } from "@/contexts/analytics/domain/services/free-analytics.repository";
import { AnalyticsApiGateway } from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

export class FreeAnalyticsQueryServiceImpl implements FreeAnalyticsQueryService {
  constructor(private readonly repository: FreeAnalyticsRepository) {}

  async handle(query: GetFreeAnalyticsQuery): Promise<FreeAnalyticsDashboard> {
    if (!query.accessToken) {
      const error = new Error("Authentication required");
      (error as Error & { status?: number }).status = 401;
      throw error;
    }

    return this.repository.getFreeDashboard(query.accessToken);
  }
}

export function createFreeAnalyticsQueryService() {
  return new FreeAnalyticsQueryServiceImpl(new AnalyticsApiGateway());
}
