"use client";

import { useState } from "react";

import { PageHeader, PageShell } from "@/contexts/shared/interfaces/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/contexts/shared/interfaces/components/ui/tabs";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import {
  AnalyticsSection,
  FreeAnalyticsErrorState,
} from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import {
  StatBadge,
  StatusBar,
  SplitMetricRow,
} from "@/contexts/analytics/interfaces/components/free-analytics/charts/stat-badge";
import {
  RankingList,
  RankingRow,
  RateRankingRow,
} from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";
import { TrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/trend-chart";
import { BarChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/bar-chart";
import {
  findPeakCategoryPoint,
  findPeakTrendPoint,
  formatMoney,
  formatNumber,
  formatTrendRange,
} from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

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

  const statusTotal =
    analytics.completedAppointmentsLastSevenDays +
    analytics.cancelledAppointmentsLastSevenDays +
    analytics.noShowAppointmentsLastSevenDays;
  const statusRange = formatTrendRange(
    analytics.appointmentsTrend[0]?.date,
    analytics.appointmentsTrend.at(-1)?.date,
  );
  const peakDay = findPeakTrendPoint(analytics.appointmentsTrend ?? []);
  const peakHour = findPeakCategoryPoint(analytics.appointmentsByHour ?? []);
  const weeklyRevenueBalance = analytics.weeklyRevenueBalance ?? {
    totalRevenue: 0,
    appointmentsCount: 0,
    averageTicket: 0,
    dailyTrend: [],
  };
  const weeklyRevenueRange = formatTrendRange(
    weeklyRevenueBalance.dailyTrend[0]?.date,
    weeklyRevenueBalance.dailyTrend.at(-1)?.date,
  );
  const topServicesByRevenue = analytics.topServicesByRevenue ?? [];
  const topCustomersBySpend = analytics.topCustomersBySpend ?? [];
  const lostRevenue = analytics.lostRevenue ?? {
    cancelledRevenue: 0,
    noShowRevenue: 0,
    totalLostRevenue: 0,
  };
  const averageTicket = analytics.averageTicket ?? {
    currentValue: 0,
    lastPeriodValue: 0,
    delta: 0,
  };

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

      {selectedGroup === "activity" ? (
        <AnalyticsSection id="activity">
          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Appointments trend</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <TrendChart data={analytics.appointmentsTrend} tone="primary" />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Appointment status mix</CardTitle>
                <p className="pt-1 text-xs text-muted-foreground">{statusRange}</p>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                <StatusBar label="Completed" value={analytics.completedAppointmentsLastSevenDays} total={statusTotal} tone="bg-emerald-500" />
                <StatusBar label="Cancelled" value={analytics.cancelledAppointmentsLastSevenDays} total={statusTotal} tone="bg-rose-500" />
                <StatusBar
                  label="No show"
                  value={analytics.noShowAppointmentsLastSevenDays}
                  total={statusTotal}
                  tone="bg-amber-500"
                  inactiveTone="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  {statusTotal > 0
                    ? `${statusTotal} final status events captured in the last 7 days.`
                    : "No final appointment status events captured in the last 7 days."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Activity snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 p-5">
                <StatBadge label="Peak day" value={peakDay.label} detail={`${formatNumber(peakDay.value)} appointments`} />
                <StatBadge label="Peak hour" value={peakHour.label} detail={`${formatNumber(peakHour.value)} appointments`} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>New vs recurring customers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <SplitMetricRow
                  label="New"
                  value={analytics.newVsRecurringCustomers.newCustomers}
                  total={analytics.newVsRecurringCustomers.totalCustomers}
                  tone="bg-primary"
                />
                <SplitMetricRow
                  label="Recurring"
                  value={analytics.newVsRecurringCustomers.recurrentCustomers}
                  total={analytics.newVsRecurringCustomers.totalCustomers}
                  tone="bg-sky-500"
                />
                <p className="text-xs text-muted-foreground">
                  New is treated as one appointment in the selected period. It is a low-cost operational proxy, not a lifetime customer classification.
                </p>
              </CardContent>
            </Card>
          </div>
        </AnalyticsSection>
      ) : null}

      {selectedGroup === "revenue" ? (
        <AnalyticsSection id="revenue">
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Weekly revenue balance</CardTitle>
                <p className="pt-1 text-xs text-muted-foreground">{weeklyRevenueRange}</p>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <StatBadge label="Total revenue" value={formatMoney(weeklyRevenueBalance.totalRevenue)} />
                  <StatBadge
                    label="Completed appointments"
                    value={formatNumber(weeklyRevenueBalance.appointmentsCount)}
                  />
                </div>
                <TrendChart
                  data={weeklyRevenueBalance.dailyTrend}
                  tone="accent"
                  valueFormatter={formatMoney}
                  unitLabel="revenue"
                />
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle>Average ticket</CardTitle>
                  <p className="pt-1 text-xs text-muted-foreground">{weeklyRevenueRange}</p>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <div className="rounded-2xl border border-border/70 bg-primary/5 p-4">
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {formatMoney(averageTicket.currentValue)}
                    </p>
                    <p className="text-sm text-muted-foreground">vs previous period</p>
                    <p className={`pt-2 text-sm font-semibold ${averageTicket.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {averageTicket.delta >= 0 ? "+" : "-"}
                      {formatMoney(Math.abs(averageTicket.delta))}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <StatBadge label="Current" value={formatMoney(averageTicket.currentValue)} />
                    <StatBadge label="Previous" value={formatMoney(averageTicket.lastPeriodValue)} />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
                <CardHeader className="border-b border-border/60 pb-4">
                  <CardTitle>Lost revenue</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  <SplitMetricRow
                    label="Cancelled"
                    value={lostRevenue.cancelledRevenue}
                    total={lostRevenue.totalLostRevenue}
                    tone="bg-rose-500"
                    valueFormatter={formatMoney}
                  />
                  <SplitMetricRow
                    label="No-show"
                    value={lostRevenue.noShowRevenue}
                    total={lostRevenue.totalLostRevenue}
                    tone="bg-amber-500"
                    inactiveTone="bg-muted"
                    valueFormatter={formatMoney}
                  />
                  <p className="text-xs text-muted-foreground">
                    {lostRevenue.totalLostRevenue > 0
                      ? `Total lost revenue: ${formatMoney(lostRevenue.totalLostRevenue)}.`
                      : "No lost revenue recorded in the selected window."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Top services by revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <BarChart
                  data={topServicesByRevenue.map((item) => ({
                    label: item.serviceName,
                    value: item.revenue,
                  }))}
                  tone="accent"
                  valueFormatter={formatMoney}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Top customers by spend</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <RankingList
                  items={topCustomersBySpend}
                  emptyLabel="No spend rankings available."
                  renderItem={(item) => (
                    <RankingRow
                      rank={item.rank}
                      label={item.customerName}
                      value={item.totalSpent}
                      meta={`${item.appointmentsCount} appointments - avg ${formatMoney(item.averageTicket)}`}
                      valueFormatter={formatMoney}
                      valueLabel="Spent"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </AnalyticsSection>
      ) : null}

      {selectedGroup === "rankings" ? (
        <AnalyticsSection id="rankings">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Top services</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <RankingList
                  items={analytics.topServices}
                  emptyLabel="No service rankings available."
                  renderItem={(item) => (
                    <RankingRow
                      rank={item.rank}
                      label={item.serviceName}
                      value={item.appointmentsCount}
                      meta={`${item.completedAppointmentsCount} completed / ${item.cancelledAppointmentsCount} cancelled`}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Top customers</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <RankingList
                  items={analytics.topCustomers}
                  emptyLabel="No customer rankings available."
                  renderItem={(item) => (
                    <RankingRow
                      rank={item.rank}
                      label={item.customerName}
                      value={item.appointmentsCount}
                      meta={`${item.completedAppointmentsCount} completed / ${item.cancelledAppointmentsCount} cancelled`}
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </AnalyticsSection>
      ) : null}

      {selectedGroup === "friction" ? (
        <AnalyticsSection id="friction">
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Cancellation rate by service</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <RankingList
                  items={analytics.cancellationRateByService}
                  emptyLabel="No cancellation rate rankings available."
                  renderItem={(item) => (
                    <RateRankingRow
                      rank={item.rank}
                      label={item.serviceName}
                      rate={item.rate}
                      affectedCount={item.affectedCount}
                      appointmentsCount={item.appointmentsCount}
                      suffix="cancelled"
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>No-show rate by service</CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <RankingList
                  items={analytics.noShowRateByService}
                  emptyLabel="No no-show rate rankings available."
                  renderItem={(item) => (
                    <RateRankingRow
                      rank={item.rank}
                      label={item.serviceName}
                      rate={item.rate}
                      affectedCount={item.affectedCount}
                      appointmentsCount={item.appointmentsCount}
                      suffix="no shows"
                    />
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </AnalyticsSection>
      ) : null}
    </PageShell>
  );
}
