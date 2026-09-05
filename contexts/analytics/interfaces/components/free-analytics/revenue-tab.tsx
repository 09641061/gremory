"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { StatBadge, SplitMetricRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/stat-badge";
import { RankingList, RankingRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/ranking-list";
import { TrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/trend-chart";
import { BarChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/bar-chart";
import { formatMoney, formatNumber, formatTrendRange } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";
import { useAnalyticsTranslations } from "@/contexts/analytics/interfaces/i18n";

interface RevenueTabProps {
  analytics: FreeAnalyticsDashboard;
}

export function RevenueTab({ analytics }: RevenueTabProps) {
  const { t } = useAnalyticsTranslations();
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
    <AnalyticsSection id="revenue">
      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.revenue.weeklyBalance}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">{weeklyRevenueRange}</p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatBadge label={t.revenue.totalRevenue} value={formatMoney(weeklyRevenueBalance.totalRevenue)} />
              <StatBadge
                label={t.revenue.completedAppointments}
                value={formatNumber(weeklyRevenueBalance.appointmentsCount)}
              />
            </div>
            <TrendChart
              data={weeklyRevenueBalance.dailyTrend}
              tone="accent"
              valueFormatter={formatMoney}
              unitLabel={t.revenue.revenueUnit}
            />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle>{t.revenue.averageTicket}</CardTitle>
              <p className="pt-1 text-xs text-muted-foreground">{weeklyRevenueRange}</p>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-2xl border border-border/70 bg-primary/5 p-4">
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {formatMoney(averageTicket.currentValue)}
                </p>
                <p className="text-sm text-muted-foreground">{t.revenue.vsPreviousPeriod}</p>
                <p className={`pt-2 text-sm font-semibold ${averageTicket.delta >= 0 ? "text-success" : "text-destructive"}`}>
                  {averageTicket.delta >= 0 ? "+" : "-"}
                  {formatMoney(Math.abs(averageTicket.delta))}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <StatBadge label={t.revenue.current} value={formatMoney(averageTicket.currentValue)} />
                <StatBadge label={t.revenue.previous} value={formatMoney(averageTicket.lastPeriodValue)} />
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle>{t.revenue.lostRevenue}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <SplitMetricRow
                label={t.revenue.cancelled}
                value={lostRevenue.cancelledRevenue}
                total={lostRevenue.totalLostRevenue}
                tone="bg-destructive"
                valueFormatter={formatMoney}
              />
              <SplitMetricRow
                label={t.revenue.noShow}
                value={lostRevenue.noShowRevenue}
                total={lostRevenue.totalLostRevenue}
                tone="bg-warning"
                inactiveTone="bg-muted"
                valueFormatter={formatMoney}
              />
              <p className="text-xs text-muted-foreground">
                {lostRevenue.totalLostRevenue > 0
                  ? t.revenue.totalLostRevenue.replace("{amount}", formatMoney(lostRevenue.totalLostRevenue))
                  : t.revenue.noLostRevenue}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.revenue.topServicesByRevenue}</CardTitle>
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
            <CardTitle>{t.revenue.topCustomersBySpend}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <RankingList
              items={topCustomersBySpend}
              emptyLabel={t.revenue.noSpendRankings}
              renderItem={(item) => (
                <RankingRow
                  rank={item.rank}
                  label={item.customerName}
                  value={item.totalSpent}
                  meta={t.revenue.customerMeta
                    .replace("{count}", String(item.appointmentsCount))
                    .replace("{avg}", formatMoney(item.averageTicket))}
                  valueFormatter={formatMoney}
                  valueLabel={t.revenue.spentLabel}
                />
              )}
            />
          </CardContent>
        </Card>
      </div>
    </AnalyticsSection>
  );
}
