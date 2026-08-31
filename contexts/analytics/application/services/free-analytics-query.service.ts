import type {
  FreeAnalyticsDashboard,
} from "@/contexts/analytics/domain/model/free-analytics-dashboard";
import type { GetFreeAnalyticsQuery } from "@/contexts/analytics/domain/model/queries/get-free-analytics.query";

export interface FreeAnalyticsQueryService {
  handle(query: GetFreeAnalyticsQuery): Promise<FreeAnalyticsDashboard>;
}
