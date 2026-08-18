"use client";

import { useState } from "react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Tabs, TabsList, TabsTrigger } from "@/contexts/shared/interfaces/components/ui/tabs";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { FreeAnalyticsErrorState } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { ActivityTab } from "./activity-tab";
import { RevenueTab } from "./revenue-tab";
import { RankingsTab } from "./rankings-tab";
import { FrictionTab } from "./friction-tab";

interface FreeAnalyticsPageViewProps {
  analytics?: FreeAnalyticsDashboard | null;
  errorMessage?: string | null;
}

type AnalyticsGroup = "activity" | "revenue" | "rankings" | "friction";

export function FreeAnalyticsPageView({ analytics, errorMessage }: FreeAnalyticsPageViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<AnalyticsGroup>("activity");

  if (!analytics) {
    return <FreeAnalyticsErrorState message={errorMessage ?? "Unable to load analytics right now."} />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        description="View only the group you need. Each group keeps the screen lighter and easier to read."
        actions={
          <Tabs value={selectedGroup} onValueChange={(value) => setSelectedGroup(value as AnalyticsGroup)} className="gap-0">
            <TabsList
              variant="line"
              className="w-full flex-wrap justify-start rounded-full border border-border bg-card p-1 shadow-sm"
            >
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="friction">Friction</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      {selectedGroup === "activity" ? <ActivityTab analytics={analytics} /> : null}
      {selectedGroup === "revenue" ? <RevenueTab analytics={analytics} /> : null}
      {selectedGroup === "rankings" ? <RankingsTab analytics={analytics} /> : null}
      {selectedGroup === "friction" ? <FrictionTab analytics={analytics} /> : null}
    </PageShell>
  );
}
