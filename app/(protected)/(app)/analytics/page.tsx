import { createFreeAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/free-analytics-query.service";
import { FreeAnalyticsPageView } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics-page-view";

export default async function AnalyticsPage() {
  try {
    const analytics = await createFreeAnalyticsQueryService().handle();
    return <FreeAnalyticsPageView analytics={analytics} />;
  } catch (error) {
    return (
      <FreeAnalyticsPageView
        errorMessage={error instanceof Error ? error.message : "Unable to load analytics."}
      />
    );
  }
}
