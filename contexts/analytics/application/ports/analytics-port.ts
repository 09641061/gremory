import type {
  AnalyticsQueryParams,
  MaxAnalyticsDashboardResponse,
  StandardAnalyticsDashboardResponse,
} from "../model/analytics.view-models";

/**
 * Server-only port for the analytics backend. Implementation lives in
 * Infrastructure and is injected via composition.
 */
export interface AnalyticsApiPort {
  getStandardDashboard(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<StandardAnalyticsDashboardResponse>;
  getMaxDashboard(
    query: AnalyticsQueryParams,
    token?: string,
    correlationId?: string,
  ): Promise<MaxAnalyticsDashboardResponse>;
}
