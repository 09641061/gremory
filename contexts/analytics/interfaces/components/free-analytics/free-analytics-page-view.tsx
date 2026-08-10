import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type {
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
    analytics.noShowAppointmentsLastSevenDays +
    analytics.inProgressAppointmentsLastSevenDays;

  return (
    <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 md:px-8">
      

      <section className="flex flex-wrap gap-2">
        <MetricChip label="Customers" value={analytics.customersCount} />
        <MetricChip label="Services" value={analytics.activeServicesCount} />
      </section>

      {!analytics.hasOrganization ? (
        <Alert className="border-dashed border-border/70 bg-background/70">
          <AlertTriangle className="size-4 text-amber-600" />
          <AlertTitle>No organization connected</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Some metrics may stay at zero until you create or connect an organization.
            </span>
            <Link
              href="/organizations"
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Go to organizations
              <ArrowRight className="size-3.5" />
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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
            <CardDescription>Distribution of the 7-day appointment window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <StatusBar label="Completed" value={analytics.completedAppointmentsLastSevenDays} total={statusTotal} tone="bg-emerald-500" />
            <StatusBar label="Cancelled" value={analytics.cancelledAppointmentsLastSevenDays} total={statusTotal} tone="bg-rose-500" />
            <StatusBar label="No show" value={analytics.noShowAppointmentsLastSevenDays} total={statusTotal} tone="bg-amber-500" />
            <p className="text-xs text-muted-foreground">
              {statusTotal > 0
                ? `${statusTotal} status events captured in the last 7 days.`
                : "No appointment status events captured in the last 7 days."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle>Customers trend</CardTitle>
            <CardDescription>Customer activity during the same 7-day window.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <TrendChart data={analytics.customersTrend} tone="secondary" />
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
          <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="size-4" />
            <AlertTitle>Analytics unavailable</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            The dashboard contract is wired, but the backend response is still needed for a live snapshot.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

function InfoChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function MetricChip({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm shadow-sm">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">
        {formatNumber(value)}
      </span>
    </div>
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

function TrendChart({
  data,
  tone,
}: {
  data: AnalyticsTrendPoint[];
  tone: "primary" | "secondary" | "accent";
}) {
  const points = buildTrendPoints(data);
  const path = buildPolyline(points);
  const area = buildArea(points);
  const colorClass = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-sky-600" : "text-emerald-600";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.length ? formatTrendRange(data[0]?.date, data[data.length - 1]?.date) : "No trend data"}</span>
        <span className={`font-semibold uppercase tracking-[0.18em] ${colorClass}`}>
          {formatNumber(data.at(-1)?.value ?? 0)} latest
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

      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <TrendTick label={data[0]?.date} value={data[0]?.value} />
        <TrendTick
          label={data[Math.floor((data.length - 1) / 2)]?.date}
          value={data[Math.floor((data.length - 1) / 2)]?.value}
        />
        <TrendTick label={data.at(-1)?.date} value={data.at(-1)?.value} alignRight />
      </div>
    </div>
  );
}

function TrendTick({
  label,
  value,
  alignRight = false,
}: {
  label?: string;
  value?: number;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-right" : "text-left"}>
      <div className="font-medium text-foreground">{label ? formatTrendDate(label) : "N/A"}</div>
      <div>{formatNumber(value ?? 0)}</div>
    </div>
  );
}

function buildTrendPoints(data: AnalyticsTrendPoint[]) {
  if (data.length === 0) return [];

  const maxValue = Math.max(...data.map((item) => item.value), 1);
  return data.map((item, index) => ({
    x: data.length === 1 ? 50 : (index / (data.length - 1)) * 100,
    y: 52 - (item.value / maxValue) * 40,
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

function formatTrendDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTrendRange(start?: string, end?: string) {
  if (!start || !end) return "Last 7 days";
  return `${formatTrendDate(start)} - ${formatTrendDate(end)}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function shortenId(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
