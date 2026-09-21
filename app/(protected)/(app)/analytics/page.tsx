import "server-only";

import React, { Suspense } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { BusinessWorkspaceApiGateway } from "@/contexts/business/infrastructure/gateways/business-workspace-api.gateway";
import { createGetStandardAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/get-standard-analytics-query.service";
import { createGetMaxAnalyticsQueryService } from "@/contexts/analytics/application/internal/queryservices/get-max-analytics-query.service";
import type { StandardAnalyticsDashboardResponse } from "@/contexts/analytics/interfaces/rest/schemas/standard-analytics.schemas";
import type { MaxAnalyticsDashboardResponse } from "@/contexts/analytics/interfaces/rest/schemas/max-analytics.schemas";
import { AnalyticsDateRange } from "@/contexts/analytics/domain/model/value-objects/analytics-date-range";
import { StandardAnalyticsView } from "@/contexts/analytics/interfaces/components/standard/standard-analytics-view";
import { MaxAnalyticsView } from "@/contexts/analytics/interfaces/components/max/max-analytics-view";
import { getAnalyticsDictionary } from "@/contexts/analytics/interfaces/i18n";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";

interface AnalyticsPageProps {
  searchParams?: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AnalyticsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AnalyticsPageContent({ searchParams }: AnalyticsPageProps) {
  const query = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(iamSessionCookies.accessToken)?.value;
  if (!accessToken) redirect("/login");

  const requestHeaders = await headers();
  const headerEstablishmentId = requestHeaders.get("x-takodu-establishment-id") ?? undefined;
  const cookieOrganizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? undefined;
  const organizationId = query.organizationId ?? cookieOrganizationId;

  const workspaceGateway = new BusinessWorkspaceApiGateway(accessToken);
  const workspace = await workspaceGateway.getWorkspace({
    organizationId,
    establishmentId: query.establishmentId ?? headerEstablishmentId,
  });

  const activeOrganizationId = workspace.organization?.id ?? organizationId;
  const establishmentId = query.establishmentId ?? headerEstablishmentId ?? workspace.activeEstablishmentId ?? undefined;

  const planName = workspace.subscription?.planName?.toLowerCase() ?? "";
  const isMaxPlan = planName.includes("max") || planName.includes("premium");

  const serverLocale = await getServerLocale();
  const dictionary = await getAnalyticsDictionary(serverLocale);
  const dateRange = AnalyticsDateRange.fromPreset("30d", isMaxPlan ? 90 : 30);

  let maxData: MaxAnalyticsDashboardResponse | null = null;
  let standardData: StandardAnalyticsDashboardResponse | null = null;
  let fetchError: unknown = null;

  try {
    if (isMaxPlan) {
      try {
        const maxService = createGetMaxAnalyticsQueryService();
        maxData = await maxService.execute(
          {
            establishmentId,
            from: dateRange.from,
            to: dateRange.to,
            organizationId: activeOrganizationId,
          },
          accessToken
        );
      } catch (maxError: unknown) {
        const status = (maxError as { status?: number })?.status;
        if (status === 403) {
          console.warn("Max analytics not authorized yet (403), falling back to standard view.");
          const standardService = createGetStandardAnalyticsQueryService();
          standardData = await standardService.execute(
            {
              establishmentId,
              from: dateRange.from,
              to: dateRange.to,
              organizationId: activeOrganizationId,
            },
            accessToken
          );
        } else {
          throw maxError;
        }
      }
    } else {
      const standardService = createGetStandardAnalyticsQueryService();
      standardData = await standardService.execute(
        {
          establishmentId,
          from: dateRange.from,
          to: dateRange.to,
          organizationId: activeOrganizationId,
        },
        accessToken
      );
    }
  } catch (error) {
    console.error("Failed to load analytics dashboard data:", error);
    fetchError = error;
  }

  if (fetchError || (!maxData && !standardData)) {
    return (
      <PageShell>
        <PageHeader
          title={isMaxPlan ? dictionary.dashboards.max.title : dictionary.dashboards.standard.title}
        />
        <ErrorAlert
          title={dictionary.state.errorTitle}
          message={dictionary.state.errorMessage}
        />
      </PageShell>
    );
  }

  if (maxData) {
    return (
      <PageShell>
        <PageHeader
          title={dictionary.dashboards.max.title}
          description={dictionary.dashboards.max.description}
        />
        <MaxAnalyticsView
          initialData={maxData}
          organizationId={activeOrganizationId}
          establishmentId={establishmentId}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title={dictionary.dashboards.standard.title}
        description={dictionary.dashboards.standard.description}
      />
      <StandardAnalyticsView
        initialData={standardData!}
        organizationId={activeOrganizationId}
        establishmentId={establishmentId}
      />
    </PageShell>
  );
}
