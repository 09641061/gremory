import { Suspense } from "react";
import { createFreeAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/free-analytics-query.service";
import { getStandardAnalyticsDashboard } from "@/contexts/analytics/application/internal/queryservices/standard-analytics-query.service";
import { FreeAnalyticsPageView } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics-page-view";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AnalyticsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AnalyticsPageContent({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  let analytics: FreeAnalyticsDashboard | null = null;
  let standardAnalytics: StandardAnalyticsDashboard | undefined;
  let errorMessage = "Unable to load analytics.";
  let standardRange: { from: string; to: string } | undefined;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value ?? null;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();
  const requestedRange = await searchParams;
  const isStandard = workspace.subscription?.planName?.toUpperCase() === "STANDARD"
    || workspace.subscription?.planName?.toUpperCase() === "PREMIUM";

  if (workspace.accessPolicy?.canOpenAnalytics !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  try {
    if (isStandard) {
      const standard = await getStandardAnalyticsDashboard({
        accessToken,
        from: requestedRange.from,
        to: requestedRange.to,
      });
      standardAnalytics = standard;
      analytics = toFreeCompatibleDashboard(standard);
      standardRange = { from: standard.from, to: standard.to };
    } else {
      analytics = await createFreeAnalyticsQueryService().handle({ accessToken });
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : errorMessage;
  }

  return (
    <FreeAnalyticsPageView
      analytics={analytics}
      standardAnalytics={standardAnalytics}
      errorMessage={analytics ? undefined : errorMessage}
      standardRange={standardRange}
    />
  );
}

function toFreeCompatibleDashboard(standard: StandardAnalyticsDashboard): FreeAnalyticsDashboard {
  return {
    completedAppointmentsLastSevenDays: standard.completedAppointments,
    cancelledAppointmentsLastSevenDays: standard.cancelledAppointments,
    noShowAppointmentsLastSevenDays: standard.noShowAppointments,
    appointmentsTrend: standard.appointmentsTrend,
    appointmentsByHour: standard.appointmentsByHour,
    newVsRecurringCustomers: standard.newVsRecurringCustomers,
    weeklyRevenueBalance: standard.weeklyRevenueBalance,
    topServicesByRevenue: standard.topServicesByRevenue,
    topCustomersBySpend: standard.topCustomersBySpend,
    lostRevenue: standard.lostRevenue,
    averageTicket: standard.averageTicket,
    topCustomers: standard.topCustomers,
    topServices: standard.topServices,
    cancellationRateByService: standard.cancellationRateByService,
    noShowRateByService: standard.noShowRateByService,
  };
}
