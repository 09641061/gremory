"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import type { StandardAnalyticsDashboard } from "@/contexts/analytics/domain/model/standard-analytics-dashboard";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { StatBadge, StatusBar, SplitMetricRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/stat-badge";
import { TrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/trend-chart";
import { ComparisonTrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/comparison-trend-chart";
import {
  findPeakCategoryPoint,
  findPeakTrendPoint,
  formatMoney,
  formatNumber,
  formatTrendRange,
} from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";
import { useAnalyticsTranslations } from "@/contexts/analytics/interfaces/i18n";

interface ActivityTabProps {
  analytics: FreeAnalyticsDashboard;
  standardAnalytics?: StandardAnalyticsDashboard;
}

export function ActivityTab({ analytics, standardAnalytics }: ActivityTabProps) {
  const { t } = useAnalyticsTranslations();
  const completedAppointments = standardAnalytics?.completedAppointments ?? analytics.completedAppointmentsLastSevenDays;
  const cancelledAppointments = standardAnalytics?.cancelledAppointments ?? analytics.cancelledAppointmentsLastSevenDays;
  const noShowAppointments = standardAnalytics?.noShowAppointments ?? analytics.noShowAppointmentsLastSevenDays;
  const statusTotal =
    completedAppointments + cancelledAppointments + noShowAppointments;
  const statusRange = formatTrendRange(
    analytics.appointmentsTrend[0]?.date,
    analytics.appointmentsTrend.at(-1)?.date,
  );
  const peakDay = findPeakTrendPoint(analytics.appointmentsTrend ?? []);
  const peakHour = findPeakCategoryPoint(analytics.appointmentsByHour ?? []);

  return (
    <AnalyticsSection id="activity">
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.appointmentsTrend}</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <TrendChart data={analytics.appointmentsTrend} tone="primary" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.statusMix}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">{statusRange}</p>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <StatusBar label={t.activity.completed} value={completedAppointments} total={statusTotal} tone="bg-success" />
            <StatusBar label={t.activity.cancelled} value={cancelledAppointments} total={statusTotal} tone="bg-destructive" />
            <StatusBar
              label={t.activity.noShow}
              value={noShowAppointments}
              total={statusTotal}
              tone="bg-warning"
              inactiveTone="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {statusTotal > 0
                ? t.activity.capturedEvents.replace("{count}", String(statusTotal))
                : t.activity.noCapturedEvents}
            </p>
          </CardContent>
        </Card>
      </div>

      {standardAnalytics ? <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.completedVsCancelled}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">{t.activity.dailyComparison}</p>
          </CardHeader>
          <CardContent className="p-5">
            <ComparisonTrendChart
              series={[
                {
                  label: t.activity.completed,
                  tone: "text-success",
                  data: standardAnalytics.completionVsCancellationTrend.map((point) => ({ date: point.date, value: point.completed })),
                },
                {
                  label: t.activity.cancelled,
                  tone: "text-destructive",
                  data: standardAnalytics.completionVsCancellationTrend.map((point) => ({ date: point.date, value: point.cancelled })),
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.standardPerformance}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">
              {t.activity.trendPeriod.replace("{from}", standardAnalytics.from).replace("{to}", standardAnalytics.to)}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <StatusBar label={t.activity.completed} value={completedAppointments} total={completedAppointments + cancelledAppointments} tone="bg-success" />
            <StatusBar label={t.activity.cancelled} value={cancelledAppointments} total={completedAppointments + cancelledAppointments} tone="bg-destructive" />
            <StatBadge
              label={t.activity.averageTicketChange}
              value={`${analytics.averageTicket.delta >= 0 ? "+" : "-"}${formatMoney(Math.abs(analytics.averageTicket.delta))}`}
              detail={t.activity.currentVsPrevious
                .replace("{current}", formatMoney(analytics.averageTicket.currentValue))
                .replace("{previous}", formatMoney(analytics.averageTicket.lastPeriodValue))}
            />
            <StatBadge
              label={t.activity.assistantAppointments}
              value={formatNumber(standardAnalytics.assistantCreatedAppointments)}
              detail={t.activity.assistantAppointmentsDetail}
            />
            <StatBadge
              label={t.activity.assistantConversion}
              value={`${Math.round(standardAnalytics.assistantConversionRate * 100)}%`}
              detail={t.activity.assistantConversionDetail
                .replace("{converted}", formatNumber(standardAnalytics.assistantConvertedChats))
                .replace("{chats}", formatNumber(standardAnalytics.assistantChats))}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.leadTime}</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">{t.activity.leadTimeSubtitle}</p>
          </CardHeader>
          <CardContent className="p-5">
            <StatBadge
              label={t.activity.averageLeadTime}
              value={`${averageLeadTime(standardAnalytics.leadTimeTrend).toFixed(1)} h`}
              detail={t.activity.leadTimeDetail}
            />
          </CardContent>
        </Card>
      </div> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.activitySnapshot}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 p-5">
            <StatBadge label={t.activity.peakDay} value={peakDay.label} detail={`${formatNumber(peakDay.value)} ${t.activity.appointmentsCount}`} />
            <StatBadge label={t.activity.peakHour} value={peakHour.label} detail={`${formatNumber(peakHour.value)} ${t.activity.appointmentsCount}`} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>{t.activity.newVsRecurringCustomers}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <SplitMetricRow
              label={t.activity.newLabel}
              value={analytics.newVsRecurringCustomers.newCustomers}
              total={analytics.newVsRecurringCustomers.totalCustomers}
              tone="bg-primary"
            />
            <SplitMetricRow
              label={t.activity.recurringLabel}
              value={analytics.newVsRecurringCustomers.recurrentCustomers}
              total={analytics.newVsRecurringCustomers.totalCustomers}
              tone="bg-info"
            />
            <p className="text-xs text-muted-foreground">
              {t.activity.newDisclaimer}
            </p>
          </CardContent>
        </Card>
      </div>
    </AnalyticsSection>
  );
}

function averageLeadTime(points: Array<{ value: number }>): number {
  if (points.length === 0) return 0;
  return points.reduce((total, point) => total + point.value, 0) / points.length;
}
