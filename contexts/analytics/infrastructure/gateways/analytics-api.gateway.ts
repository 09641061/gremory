import "server-only";

import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { apiConfig } from "@/api.config";
import {
  standardAnalyticsDashboardResponseSchema,
  type StandardAnalyticsDashboardResponse,
} from "../../interfaces/rest/schemas/standard-analytics.schemas";
import {
  maxAnalyticsDashboardResponseSchema,
  type MaxAnalyticsDashboardResponse,
} from "../../interfaces/rest/schemas/max-analytics.schemas";

export interface AnalyticsQueryParams {
  establishmentId?: string;
  from: string;
  to: string;
  organizationId?: string;
}

export class AnalyticsApiGateway {
  static async getStandardDashboard(
    query: AnalyticsQueryParams,
    token?: string
  ): Promise<StandardAnalyticsDashboardResponse> {
    const headers: Record<string, string> = {};
    if (query.organizationId) {
      headers["X-Organization-Id"] = query.organizationId;
    }

    const params = new URLSearchParams();
    if (query.establishmentId) params.set("establishmentId", query.establishmentId);
    params.set("from", query.from);
    params.set("to", query.to);

    const endpoint = `${apiConfig.routes.analytics.standard}?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint, {
      token,
      headers,
      errorMessage: "Failed to fetch standard analytics dashboard",
    });

    return standardAnalyticsDashboardResponseSchema.parse(response);
  }

  static async getMaxDashboard(
    query: AnalyticsQueryParams,
    token?: string
  ): Promise<MaxAnalyticsDashboardResponse> {
    const headers: Record<string, string> = {};
    if (query.organizationId) {
      headers["X-Organization-Id"] = query.organizationId;
    }

    const params = new URLSearchParams();
    if (query.establishmentId) params.set("establishmentId", query.establishmentId);
    params.set("from", query.from);
    params.set("to", query.to);

    const endpoint = `${apiConfig.routes.analytics.max}?${params.toString()}`;
    const response = await apiClient.get<unknown>(endpoint, {
      token,
      headers,
      errorMessage: "Failed to fetch max analytics dashboard",
    });

    return maxAnalyticsDashboardResponseSchema.parse(response);
  }
}
