import { createFreeAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/free-analytics-query.service";
import { FreeAnalyticsPageView } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics-page-view";

export default async function AnalyticsPage() {
  let analytics;
  let errorMessage = "Unable to load analytics.";

  try {
    analytics = await createFreeAnalyticsQueryService().handle();
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : errorMessage;
  }

  return <FreeAnalyticsPageView analytics={analytics} errorMessage={analytics ? undefined : errorMessage} />;
}
