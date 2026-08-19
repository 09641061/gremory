import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type { FreeAnalyticsDashboard } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { AnalyticsSection } from "@/contexts/analytics/interfaces/components/free-analytics/charts/analytics-section";
import { StatBadge, StatusBar, SplitMetricRow } from "@/contexts/analytics/interfaces/components/free-analytics/charts/stat-badge";
import { TrendChart } from "@/contexts/analytics/interfaces/components/free-analytics/charts/trend-chart";
import {
  findPeakCategoryPoint,
  findPeakTrendPoint,
  formatNumber,
  formatTrendRange,
} from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

interface ActivityTabProps {
  analytics: FreeAnalyticsDashboard;
}

export function ActivityTab({ analytics }: ActivityTabProps) {
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
            <StatusBar label="Completed" value={analytics.completedAppointmentsLastSevenDays} total={statusTotal} tone="bg-success" />
            <StatusBar label="Cancelled" value={analytics.cancelledAppointmentsLastSevenDays} total={statusTotal} tone="bg-destructive" />
            <StatusBar
              label="No show"
              value={analytics.noShowAppointmentsLastSevenDays}
              total={statusTotal}
              tone="bg-warning"
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
