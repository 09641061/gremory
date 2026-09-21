import "server-only";

import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { apiConfig } from "@/api.config";
import {
  standardAnalyticsDashboardResponseSchema,
  type StandardAnalyticsDashboardResponse,
} from "../contracts/standard-analytics.schemas";
import {
  maxAnalyticsDashboardResponseSchema,
  type MaxAnalyticsDashboardResponse,
} from "../contracts/max-analytics.schemas";
import type {
  AnalyticsApiPort,
} from "../../application/ports/analytics-port";
import type {
  AnalyticsQueryParams,
} from "../../application/model/analytics.view-models";

export type { AnalyticsQueryParams };

export class AnalyticsApiGateway implements AnalyticsApiPort {
  async getStandardDashboard(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<StandardAnalyticsDashboardResponse> {
    const params = new URLSearchParams();
    if (query.establishmentId) params.set("establishmentId", query.establishmentId);
    params.set("from", query.from);
    params.set("to", query.to);
    const endpoint = `${apiConfig.routes.analytics.standard}?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint, {
      token,
      tenantId: query.organizationId,
      correlationId,
      errorMessage: "Failed to fetch standard analytics dashboard",
    });
    return standardAnalyticsDashboardResponseSchema.parse(response);
  }

  async getMaxDashboard(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<MaxAnalyticsDashboardResponse> {
    const params = new URLSearchParams();
    if (query.establishmentId) params.set("establishmentId", query.establishmentId);
    params.set("from", query.from);
    params.set("to", query.to);
    const endpoint = `${apiConfig.routes.analytics.max}?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint, {
      token,
      tenantId: query.organizationId,
      correlationId,
      errorMessage: "Failed to fetch max analytics dashboard",
    });
    return maxAnalyticsDashboardResponseSchema.parse(response);
  }
}
