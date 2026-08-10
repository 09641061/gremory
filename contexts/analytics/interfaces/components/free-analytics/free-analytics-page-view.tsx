import type { ReactNode } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type {
  AnalyticsCategoryPoint,
  AnalyticsDualTrendPoint,
  AnalyticsTrendPoint,
  FreeAnalyticsDashboardResponse,
} from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

interface FreeAnalyticsPageViewProps {
  analytics?: FreeAnalyticsDashboardResponse | null;
  errorMessage?: string | null;
}

export function FreeAnalyticsPageView({ analytics, errorMessage }: FreeAnalyticsPageViewProps) {
  if (!analytics) {
    return <FreeAnalyticsErrorState message={errorMessage ?? "Unable to load analytics right now."} />;
  }

  const statusTotal =
    analytics.completedAppointmentsLastSevenDays +
    analytics.cancelledAppointmentsLastSevenDays +
    analytics.noShowAppointmentsLastSevenDays;

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 md:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Appointments trend</CardTitle>
            <CardDescription>Daily appointment volume across the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <TrendChart data={analytics.appointmentsTrend} tone="primary" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Appointment status mix</CardTitle>
            <CardDescription>Completed, cancelled, and no-show appointments in the window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <StatusBar label="Completed" value={analytics.completedAppointmentsLastSevenDays} total={statusTotal} tone="bg-emerald-500" />
            <StatusBar label="Cancelled" value={analytics.cancelledAppointmentsLastSevenDays} total={statusTotal} tone="bg-rose-500" />
            <StatusBar label="No show" value={analytics.noShowAppointmentsLastSevenDays} total={statusTotal} tone="bg-amber-500" />
            <p className="text-xs text-muted-foreground">
              {statusTotal > 0
                ? `${statusTotal} final status events captured in the last 7 days.`
                : "No final appointment status events captured in the last 7 days."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Appointments by weekday</CardTitle>
            <CardDescription>Which days of the week receive the most bookings.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <BarChart data={analytics.appointmentsByWeekday} tone="primary" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Appointments by hour</CardTitle>
            <CardDescription>Booking volume by UTC hour across the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <BarChart data={analytics.appointmentsByHour} tone="secondary" dense labelEvery={3} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Completed vs cancelled</CardTitle>
            <CardDescription>Trend comparison for the two final outcomes that matter most.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <DualTrendChart data={analytics.completionVsCancellationTrend} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Lead time average</CardTitle>
            <CardDescription>Average hours between booking creation and appointment start.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <TrendChart
              data={analytics.leadTimeTrend}
              tone="accent"
              valueFormatter={(value) => `${value.toFixed(1)}h`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>New vs recurring customers</CardTitle>
            <CardDescription>
              Customers with a single appointment in the period vs those who booked more than once.
            </CardDescription>
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

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Top services</CardTitle>
            <CardDescription>Most booked services in the period.</CardDescription>
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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Top customers</CardTitle>
            <CardDescription>Customers with the most appointments in the period.</CardDescription>
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

        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Cancellation rate by service</CardTitle>
            <CardDescription>Services with the highest share of cancelled bookings.</CardDescription>
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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>No-show rate by service</CardTitle>
            <CardDescription>Services with the highest share of no-shows.</CardDescription>
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
    </main>
  );
}

function FreeAnalyticsErrorState({ message }: { message: string }) {
  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 md:px-8">
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-2 rounded-lg border border-dashed border-border/70 bg-background/70 p-4">
            <p className="text-sm font-semibold text-foreground">Analytics unavailable</p>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            The dashboard contract is wired, but the backend response is still needed for a live snapshot.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function StatusBar({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const width = total > 0 ? Math.max(5, (value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-foreground">{formatNumber(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SplitMetricRow({
  label,
  value,
  total,
  tone,
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
}) {
  const width = total > 0 ? Math.max(8, (value / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {formatNumber(value)} {total > 0 ? `(${Math.round((value / total) * 100)}%)` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function RankingList<T>({
  items,
  emptyLabel,
  renderItem,
}: {
  items: ReadonlyArray<T>;
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
}) {
  if (items.length === 0) {
    return <div className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">{emptyLabel}</div>;
  }

  return <div className="space-y-2">{items.map((item, index) => <div key={index}>{renderItem(item)}</div>)}</div>;
}

function RankingRow({
  rank,
  label,
  value,
  meta,
}: {
  rank: number;
  label: string;
  value: number;
  meta: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/70 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {rank}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">{meta}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-foreground">{formatNumber(value)}</div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Appointments</div>
      </div>
    </div>
  );
}

function RateRankingRow({
  rank,
  label,
  rate,
  affectedCount,
  appointmentsCount,
  suffix,
}: {
  rank: number;
  label: string;
  rate: number;
  affectedCount: number;
  appointmentsCount: number;
  suffix: string;
}) {
  const percent = Math.round(rate * 100);

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-background/70 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {rank}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{label}</p>
          <p className="truncate text-xs text-muted-foreground">
            {affectedCount} {suffix} out of {appointmentsCount} appointments
          </p>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-foreground">{percent}%</div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Rate</div>
      </div>
    </div>
  );
}

function TrendChart({
  data,
  tone,
  valueFormatter,
}: {
  data: AnalyticsTrendPoint[];
  tone: "primary" | "secondary" | "accent";
  valueFormatter?: (value: number) => string;
}) {
  const points = buildTrendPoints(data.map((item) => item.value));
  const path = buildPolyline(points);
  const area = buildArea(points);
  const colorClass = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-sky-600" : "text-emerald-600";
  const currentValue = data.at(-1)?.value ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.length ? formatTrendRange(data[0]?.date, data[data.length - 1]?.date) : "No trend data"}</span>
        <span className={`font-semibold uppercase tracking-[0.18em] ${colorClass}`}>
          {valueFormatter ? valueFormatter(currentValue) : formatNumber(currentValue)} latest
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/60 p-4">
        <svg viewBox="0 0 100 60" className="h-44 w-full">
          <g className="text-border/70">
            <line x1="0" y1="12" x2="100" y2="12" stroke="currentColor" strokeDasharray="1.5 2.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeDasharray="1.5 2.5" />
            <line x1="0" y1="48" x2="100" y2="48" stroke="currentColor" strokeDasharray="1.5 2.5" />
          </g>
          <path d={area} fill="currentColor" fillOpacity="0.12" className={colorClass} />
          <polyline
            points={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className={colorClass}
          />
          {points.map((point, index) => (
            <circle
              key={`${point.x}-${point.y}-${index}`}
              cx={point.x}
              cy={point.y}
              r="1.8"
              className={colorClass}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function DualTrendChart({
  data,
}: {
  data: AnalyticsDualTrendPoint[];
}) {
  const completedPoints = buildTrendPoints(data.map((item) => item.completed));
  const cancelledPoints = buildTrendPoints(data.map((item) => item.cancelled));
  const completedPath = buildPolyline(completedPoints);
  const cancelledPath = buildPolyline(cancelledPoints);
  const completedArea = buildArea(completedPoints);
  const cancelledArea = buildArea(cancelledPoints);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Legend label="Completed" tone="bg-emerald-500" />
        <Legend label="Cancelled" tone="bg-rose-500" />
      </div>
      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/60 p-4">
        <svg viewBox="0 0 100 60" className="h-44 w-full">
          <g className="text-border/70">
            <line x1="0" y1="12" x2="100" y2="12" stroke="currentColor" strokeDasharray="1.5 2.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="currentColor" strokeDasharray="1.5 2.5" />
            <line x1="0" y1="48" x2="100" y2="48" stroke="currentColor" strokeDasharray="1.5 2.5" />
          </g>
          <path d={completedArea} fill="currentColor" fillOpacity="0.12" className="text-emerald-500" />
          <path d={cancelledArea} fill="currentColor" fillOpacity="0.12" className="text-rose-500" />
          <polyline
            points={completedPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="text-emerald-500"
          />
          <polyline
            points={cancelledPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
            className="text-rose-500"
          />
        </svg>
      </div>
    </div>
  );
}

function BarChart({
  data,
  tone,
  dense = false,
  labelEvery = 1,
}: {
  data: AnalyticsCategoryPoint[];
  tone: "primary" | "secondary" | "accent";
  dense?: boolean;
  labelEvery?: number;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const barClass = tone === "primary" ? "bg-primary" : tone === "secondary" ? "bg-sky-500" : "bg-emerald-500";

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-4">
      <div
        className={`grid items-end gap-2 ${dense ? "min-w-[1040px]" : "min-w-0"}`}
        style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}
      >
        {data.map((item) => {
          const height = maxValue > 0 ? Math.max(8, (item.value / maxValue) * 100) : 0;
          const showLabel = labelEvery <= 1 || data.indexOf(item) % labelEvery === 0 || data.indexOf(item) === data.length - 1;

          return (
            <div key={item.label} className="flex min-w-0 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end">
                <div className={`w-full rounded-t-md ${barClass}`} style={{ height: `${height}%` }} />
              </div>
              <div className="text-xs font-semibold text-foreground">{formatNumber(item.value)}</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {showLabel ? item.label : "\u00a0"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Legend({
  label,
  tone,
}: {
  label: string;
  tone: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-2 rounded-full ${tone}`} />
      <span>{label}</span>
    </span>
  );
}

function buildTrendPoints(values: number[]) {
  if (values.length === 0) return [];

  const maxValue = Math.max(...values, 1);
  return values.map((value, index) => ({
    x: values.length === 1 ? 50 : (index / (values.length - 1)) * 100,
    y: 52 - (value / maxValue) * 40,
  }));
}

function buildPolyline(points: Array<{ x: number; y: number }>) {
  return points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
}

function buildArea(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "M 0 52 L 100 52 L 100 52 L 0 52 Z";

  const first = points[0];
  const last = points[points.length - 1];
  const line = points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" L ");
  return `M ${first.x.toFixed(2)} 52 L ${line} L ${last.x.toFixed(2)} 52 Z`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatTrendRange(start?: string, end?: string) {
  if (!start || !end) return "Last 7 days";
  return `${formatTrendDate(start)} - ${formatTrendDate(end)}`;
}

function formatTrendDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
