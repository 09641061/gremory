import { createFreeAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/free-analytics-query.service";
import { FreeAnalyticsPageView } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics-page-view";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  let analytics: FreeAnalyticsDashboard | null = null;
  let errorMessage = "Unable to load analytics.";
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value ?? null;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();

  if (workspace.capabilities?.canReadAnalytics === false) {
    redirect("/access-denied");
  }

  try {
    analytics = await createFreeAnalyticsQueryService().handle({ accessToken });
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : errorMessage;
  }

  return <FreeAnalyticsPageView analytics={analytics} errorMessage={analytics ? undefined : errorMessage} />;
}
