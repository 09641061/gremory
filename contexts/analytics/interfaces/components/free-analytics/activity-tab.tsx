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

interface ActivityTabProps {
  analytics: FreeAnalyticsDashboard;
  standardAnalytics?: StandardAnalyticsDashboard;
}

export function ActivityTab({ analytics, standardAnalytics }: ActivityTabProps) {
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
            <StatusBar label="Completed" value={completedAppointments} total={statusTotal} tone="bg-success" />
            <StatusBar label="Cancelled" value={cancelledAppointments} total={statusTotal} tone="bg-destructive" />
            <StatusBar
              label="No show"
              value={noShowAppointments}
              total={statusTotal}
              tone="bg-warning"
              inactiveTone="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              {statusTotal > 0
                ? `${statusTotal} final status events captured in the selected period.`
                : "No final appointment status events captured in the selected period."}
            </p>
          </CardContent>
        </Card>
      </div>

      {standardAnalytics ? <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Completed vs cancelled</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">Daily comparison for the selected period.</p>
          </CardHeader>
          <CardContent className="p-5">
            <ComparisonTrendChart
              series={[
                {
                  label: "Completed",
                  tone: "text-success",
                  data: standardAnalytics.completionVsCancellationTrend.map((point) => ({ date: point.date, value: point.completed })),
                },
                {
                  label: "Cancelled",
                  tone: "text-destructive",
                  data: standardAnalytics.completionVsCancellationTrend.map((point) => ({ date: point.date, value: point.cancelled })),
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Standard performance</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">
              Completion and cancellation trend for {standardAnalytics.from} to {standardAnalytics.to}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <StatusBar label="Completed" value={completedAppointments} total={completedAppointments + cancelledAppointments} tone="bg-success" />
            <StatusBar label="Cancelled" value={cancelledAppointments} total={completedAppointments + cancelledAppointments} tone="bg-destructive" />
            <StatBadge
              label="Average ticket change"
              value={`${analytics.averageTicket.delta >= 0 ? "+" : "-"}${formatMoney(Math.abs(analytics.averageTicket.delta))}`}
              detail={`Current ${formatMoney(analytics.averageTicket.currentValue)} vs previous ${formatMoney(analytics.averageTicket.lastPeriodValue)}`}
            />
            <StatBadge
              label="Appointments created by Assistant"
              value={formatNumber(standardAnalytics.assistantCreatedAppointments)}
              detail="Appointments attributed to the Assistant in the selected period"
            />
            <StatBadge
              label="Assistant conversion"
              value={`${Math.round(standardAnalytics.assistantConversionRate * 100)}%`}
              detail={`${formatNumber(standardAnalytics.assistantConvertedChats)} of ${formatNumber(standardAnalytics.assistantChats)} chats created an appointment`}
            />
          </CardContent>
        </Card>
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Lead time</CardTitle>
            <p className="pt-1 text-xs text-muted-foreground">Average hours between booking and appointment.</p>
          </CardHeader>
          <CardContent className="p-5">
            <StatBadge
              label="Average lead time"
              value={`${averageLeadTime(standardAnalytics.leadTimeTrend).toFixed(1)} h`}
              detail="Calculated from appointments in the selected period"
            />
          </CardContent>
        </Card>
      </div> : null}

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
              tone="bg-info"
            />
            <p className="text-xs text-muted-foreground">
              New is treated as one appointment in the selected period. It is a low-cost operational proxy, not a lifetime customer classification.
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
