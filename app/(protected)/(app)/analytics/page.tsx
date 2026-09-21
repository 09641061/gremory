import "server-only";

import React, { Suspense } from "react";
import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/layout/page-shell";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { requireAnalyticsContext } from "@/contexts/analytics/interfaces/authorization/analytics-authorization";
import { composeAnalyticsAdapters } from "@/contexts/analytics/interfaces/server/analytics-composition";
import { AnalyticsDateRange } from "@/contexts/analytics/domain/model/value-objects/analytics-date-range";
import type { MaxAnalyticsDashboardResponse, StandardAnalyticsDashboardResponse } from "@/contexts/analytics/application/model/analytics.view-models";
import { MaxAnalyticsView } from "@/contexts/analytics/interfaces/components/max/max-analytics-view";
import { StandardAnalyticsView } from "@/contexts/analytics/interfaces/components/standard/standard-analytics-view";
import { getAnalyticsDictionary } from "@/contexts/analytics/interfaces/i18n";
import { getServerLocale } from "@/contexts/shared/infrastructure/i18n/server";
import { createCorrelationId } from "@/contexts/shared/infrastructure/http/api-client";

interface AnalyticsPageProps {
  searchParams?: Promise<{ establishmentId?: string }>;
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
  const context = await requireAnalyticsContext(query.establishmentId);
  const dictionary = await getAnalyticsDictionary(await getServerLocale());
  const useMax = context.canRequestMax;
  const range = AnalyticsDateRange.fromPreset("30d", useMax ? 90 : 30);
  const params = {
    organizationId: context.organizationId,
    establishmentId: context.establishmentId,
    from: range.from,
    to: range.to,
  };
  const composed = composeAnalyticsAdapters();
  const correlationId = createCorrelationId();

  let maxData: MaxAnalyticsDashboardResponse | null = null;
  let standardData: StandardAnalyticsDashboardResponse | null = null;
  try {
    if (useMax) {
      try {
        maxData = await composed.maxQueryService.execute(params, context.token, correlationId);
      } catch (error) {
        if ((error as { status?: number }).status !== 403) throw error;
        standardData = await composed.standardQueryService.execute(params, context.token, correlationId);
      }
    } else {
      standardData = await composed.standardQueryService.execute(params, context.token, correlationId);
    }
  } catch {
    return (
      <PageShell>
        <PageHeader title={useMax ? dictionary.dashboards.max.title : dictionary.dashboards.standard.title} />
        <ErrorAlert title={dictionary.state.errorTitle} message={dictionary.state.errorMessage} />
      </PageShell>
    );
  }

  if (maxData) {
    return (
      <PageShell>
        <PageHeader title={dictionary.dashboards.max.title} description={dictionary.dashboards.max.description} />
        <MaxAnalyticsView initialData={maxData} organizationId={context.organizationId} establishmentId={context.establishmentId} />
      </PageShell>
    );
  }
  return (
    <PageShell>
      <PageHeader title={dictionary.dashboards.standard.title} description={dictionary.dashboards.standard.description} />
      <StandardAnalyticsView initialData={standardData!} organizationId={context.organizationId} establishmentId={context.establishmentId} />
    </PageShell>
  );
}
