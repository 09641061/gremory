"use client";

import { useState } from "react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Tabs, TabsList, TabsTrigger } from "@/contexts/shared/interfaces/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { FreeAnalyticsErrorState } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { ActivityTab } from "./activity-tab";
import { RevenueTab } from "./revenue-tab";
import { RankingsTab } from "./rankings-tab";
import { FrictionTab } from "./friction-tab";
import { useAnalyticsTranslations } from "@/contexts/analytics/interfaces/i18n";

interface FreeAnalyticsPageViewProps {
  analytics?: FreeAnalyticsDashboard | null;
  errorMessage?: string | null;
  noticeMessage?: string | null;
  standardRange?: { from: string; to: string };
  standardAnalytics?: StandardAnalyticsDashboard;
}

type AnalyticsGroup = "activity" | "revenue" | "rankings" | "friction";

export function FreeAnalyticsPageView({
  analytics,
  errorMessage,
  noticeMessage,
  standardRange,
  standardAnalytics,
}: FreeAnalyticsPageViewProps) {
  const { t } = useAnalyticsTranslations();
  const [selectedGroup, setSelectedGroup] = useState<AnalyticsGroup>("activity");

  if (!analytics) {
    return <FreeAnalyticsErrorState message={errorMessage ?? t.dashboard.loadError} />;
  }

  return (
    <PageShell>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
        actions={
          <div className="flex flex-wrap items-end justify-end gap-3">
            {standardRange ? (
              <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
                <label className="grid gap-1 text-muted-foreground">
                  <span>{t.dashboard.from}</span>
                  <input
                    type="date"
                    name="from"
                    defaultValue={standardRange.from}
                    max={standardRange.to}
                    className="h-9 rounded-md border border-border bg-background px-2 text-foreground"
                  />
                </label>
                <label className="grid gap-1 text-muted-foreground">
                  <span>{t.dashboard.to}</span>
                  <input
                    type="date"
                    name="to"
                    defaultValue={standardRange.to}
                    min={standardRange.from}
                    className="h-9 rounded-md border border-border bg-background px-2 text-foreground"
                  />
                </label>
                <button
                  type="submit"
                  className="h-9 rounded-md border border-border bg-card px-3 font-medium text-foreground hover:bg-muted"
                >
                  {t.dashboard.apply}
                </button>
              </form>
            ) : null}
            <Tabs value={selectedGroup} onValueChange={(value) => setSelectedGroup(value as AnalyticsGroup)} className="gap-0">
              <TabsList
                variant="line"
                className="w-full flex-wrap justify-start rounded-full border border-border bg-card p-1 shadow-sm"
              >
                <TabsTrigger value="activity">{t.dashboard.activityTab}</TabsTrigger>
                <TabsTrigger value="revenue">{t.dashboard.revenueTab}</TabsTrigger>
                <TabsTrigger value="rankings">{t.dashboard.rankingsTab}</TabsTrigger>
                <TabsTrigger value="friction">{t.dashboard.frictionTab}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        }
      />

      {noticeMessage ? (
        <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
          <AlertTitle>{t.dashboard.rangeAdjustedTitle}</AlertTitle>
          <AlertDescription>{noticeMessage}</AlertDescription>
        </Alert>
      ) : null}

      {selectedGroup === "activity" ? <ActivityTab analytics={analytics} standardAnalytics={standardAnalytics} /> : null}
      {selectedGroup === "revenue" ? <RevenueTab analytics={analytics} /> : null}
      {selectedGroup === "rankings" ? <RankingsTab analytics={analytics} /> : null}
      {selectedGroup === "friction" ? <FrictionTab analytics={analytics} standardAnalytics={standardAnalytics} /> : null}
    </PageShell>
  );
}
