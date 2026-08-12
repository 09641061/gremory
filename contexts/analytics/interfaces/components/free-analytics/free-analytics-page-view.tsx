"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";
import type {
  AnalyticsCategoryPoint,
  AnalyticsTrendPoint,
  FreeAnalyticsDashboardResponse,
} from "@/contexts/analytics/infrastructure/gateways/analytics-api.gateway";

interface FreeAnalyticsPageViewProps {
  analytics?: FreeAnalyticsDashboardResponse | null;
  errorMessage?: string | null;
}

export function FreeAnalyticsPageView({ analytics, errorMessage }: FreeAnalyticsPageViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<AnalyticsGroup>("activity");

  if (!analytics) {
    return <FreeAnalyticsErrorState message={errorMessage ?? "Unable to load analytics right now."} />;
  }

  const statusTotal =
    analytics.completedAppointmentsLastSevenDays +
    analytics.cancelledAppointmentsLastSevenDays +
    analytics.noShowAppointmentsLastSevenDays;
  const statusRange = formatTrendRange(analytics.appointmentsTrend[0]?.date, analytics.appointmentsTrend.at(-1)?.date);
  const monthRange = formatMonthRange(analytics.appointmentsByMonth);
  const hourRange = statusRange;
  const monthData = analytics.appointmentsByMonth ?? [];
  const hourData = buildTwoHourSeries(analytics.appointmentsByHour ?? []);
  const weeklyRevenueBalance = analytics.weeklyRevenueBalance ?? {
    totalRevenue: 0,
    appointmentsCount: 0,
    averageTicket: 0,
    dailyTrend: [],
  };
  const weeklyRevenueRange = formatTrendRange(weeklyRevenueBalance.dailyTrend[0]?.date, weeklyRevenueBalance.dailyTrend.at(-1)?.date);
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
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="page-title">Analytics</h1>
          <p className="page-description max-w-2xl">
            View only the group you need. Each group keeps the screen lighter and easier to read.
          </p>
        </div>
        <div className="rounded-full border border-border bg-card p-1 shadow-sm">
          <div className="flex flex-wrap gap-1">
            <GroupTab label="Activity" active={selectedGroup === "activity"} onClick={() => setSelectedGroup("activity")} />
            <GroupTab label="Revenue" active={selectedGroup === "revenue"} onClick={() => setSelectedGroup("revenue")} />
            <GroupTab label="Rankings" active={selectedGroup === "rankings"} onClick={() => setSelectedGroup("rankings")} />
            <GroupTab label="Friction" active={selectedGroup === "friction"} onClick={() => setSelectedGroup("friction")} />
          </div>
        </div>
      </div>

      {selectedGroup === "activity" ? (
      <AnalyticsSection
        id="activity"
        title="Activity"
        description="Appointments, timing, mix and customer behavior."
      >
        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
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
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm xl:col-span-2">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle>Appointments by month</CardTitle>
              <CardDescription>Monthly appointment volume in the current year.</CardDescription>
              <p className="pt-1 text-xs text-muted-foreground">{monthRange}</p>
            </CardHeader>
            <CardContent className="p-5">
              <BarChart data={monthData} tone="primary" />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle>Appointments by hour</CardTitle>
              <CardDescription>Booking volume by local hour across the last 7 days.</CardDescription>
              <p className="pt-1 text-xs text-muted-foreground">{hourRange}</p>
            </CardHeader>
            <CardContent className="p-5">
              <CompactHourHeatmap data={hourData} />
            </CardContent>
          </Card>
        </div>

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
      </AnalyticsSection>
      ) : null}

      {selectedGroup === "revenue" ? (
      <AnalyticsSection
        id="revenue"
        title="Revenue"
        description="Revenue, ticket size and revenue lost."
      >
        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle>Weekly revenue balance</CardTitle>
              <CardDescription>Completed revenue across the last 7 days.</CardDescription>
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
              <TrendChart data={weeklyRevenueBalance.dailyTrend} tone="accent" valueFormatter={formatMoney} unitLabel="revenue" />
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Average ticket</CardTitle>
                <CardDescription>Revenue per completed appointment in the current period.</CardDescription>
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
                <CardDescription>Estimated revenue lost to cancellations and no-shows.</CardDescription>
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
              <CardDescription>Services that generated the most completed revenue in the period.</CardDescription>
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
              <CardDescription>Customers with the highest completed spend in the period.</CardDescription>
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
      <AnalyticsSection
        id="rankings"
        title="Rankings"
        description="The most booked services and most active customers."
      >
        <div className="grid gap-6 xl:grid-cols-2">
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
        </div>
      </AnalyticsSection>
      ) : null}

      {selectedGroup === "friction" ? (
      <AnalyticsSection
        id="friction"
        title="Friction"
        description="Where service friction appears in cancellations and no-shows."
      >
        <div className="grid gap-6 xl:grid-cols-2">
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
      </AnalyticsSection>
      ) : null}
    </main>
  );
}

function AnalyticsSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="space-y-4 scroll-mt-8">
      <div className="flex flex-col gap-1 px-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

type AnalyticsGroup = "activity" | "revenue" | "rankings" | "friction";

function GroupTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className="rounded-full"
    >
      {label}
    </Button>
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
  inactiveTone = "bg-muted/40",
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
  inactiveTone?: string;
}) {
  const width = total > 0 ? Math.max(5, (value / total) * 100) : 0;
  const barTone = value > 0 ? tone : inactiveTone;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-foreground">{formatNumber(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SplitMetricRow({
  label,
  value,
  total,
  tone,
  valueFormatter = formatNumber,
  inactiveTone = "bg-muted/40",
}: {
  label: string;
  value: number;
  total: number;
  tone: string;
  valueFormatter?: (value: number) => string;
  inactiveTone?: string;
}) {
  const width = total > 0 ? Math.max(8, (value / total) * 100) : 0;
  const barTone = value > 0 ? tone : inactiveTone;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold text-foreground">
          {valueFormatter(value)} {total > 0 ? `(${Math.round((value / total) * 100)}%)` : ""}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${width}%` }} />
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
  valueFormatter = formatNumber,
  valueLabel = "Appointments",
}: {
  rank: number;
  label: string;
  value: number;
  meta: string;
  valueFormatter?: (value: number) => string;
  valueLabel?: string;
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
        <div className="text-sm font-semibold text-foreground">{valueFormatter(value)}</div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{valueLabel}</div>
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
  unitLabel = "appointments",
}: {
  data: AnalyticsTrendPoint[];
  tone: "primary" | "secondary" | "accent";
  valueFormatter?: (value: number) => string;
  unitLabel?: string;
}) {
  const points = buildTrendPoints(data.map((item) => item.value));
  const path = buildPolyline(points);
  const area = buildArea(points);
  const colorClass = tone === "primary" ? "text-primary" : tone === "secondary" ? "text-sky-600" : "text-emerald-600";
  const currentValue = data.at(-1)?.value ?? 0;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const yAxisTicks = buildYAxisTicks(maxValue);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;
  const hoveredCoords = hoveredIndex !== null ? points[hoveredIndex] : null;
  const showTooltipBelow = hoveredCoords ? hoveredCoords.y < 20 : false;
  const tooltipLeft = hoveredCoords ? Math.min(92, Math.max(8, hoveredCoords.x)) : 50;
  const tooltipTop = hoveredCoords ? (showTooltipBelow ? Math.min(88, hoveredCoords.y + 8) : Math.max(10, hoveredCoords.y - 6)) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{data.length ? formatTrendRange(data[0]?.date, data[data.length - 1]?.date) : "No trend data"}</span>
        <span className={`font-semibold uppercase tracking-[0.18em] ${colorClass}`}>
          {valueFormatter ? valueFormatter(currentValue) : formatNumber(currentValue)} latest
        </span>
      </div>

      <div className="overflow-visible rounded-xl border border-border/60 bg-background/60 p-4">
        <div className="grid gap-3 md:grid-cols-[56px_minmax(0,1fr)]">
          <div className="flex h-44 flex-col justify-between py-1 text-[11px] font-medium text-muted-foreground">
            {yAxisTicks.map((tick) => (
              <span key={tick.value}>{formatTrendTick(tick.value, valueFormatter)}</span>
            ))}
          </div>

          <div className="relative overflow-visible">
            {hoveredPoint && hoveredCoords ? (
              <div
                className={`pointer-events-none absolute z-20 max-w-[190px] rounded-lg border border-border/70 bg-card px-3 py-2 shadow-lg ${
                  showTooltipBelow ? "translate-y-0" : "-translate-y-full"
                }`}
                style={{
                  left: `${tooltipLeft}%`,
                  top: `${tooltipTop}%`,
                  transform: `translateX(-50%) ${showTooltipBelow ? "" : "translateY(-100%)"}`.trim(),
                }}
              >
                <p className="text-xs font-semibold text-foreground">{formatTrendDateLabel(hoveredPoint.date)}</p>
                <p className="text-xs text-muted-foreground">
                  {valueFormatter ? valueFormatter(hoveredPoint.value) : formatNumber(hoveredPoint.value)} {unitLabel}
                </p>
              </div>
            ) : null}

            <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-52 w-full">
              <g className="text-border/70">
                {yAxisTicks.map((tick) => (
                  <line
                    key={`grid-${tick.value}`}
                    x1="6"
                    y1={tick.y}
                    x2="100"
                    y2={tick.y}
                    stroke="currentColor"
                    strokeDasharray="1.5 2.5"
                  />
                ))}
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
                  r={hoveredIndex === index ? "2.8" : "2"}
                  className={colorClass}
                  fill="currentColor"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onFocus={() => setHoveredIndex(index)}
                  onBlur={() => setHoveredIndex(null)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${formatTrendDateLabel(data[index]?.date)}: ${valueFormatter ? valueFormatter(data[index]?.value ?? 0) : formatNumber(data[index]?.value ?? 0)} ${unitLabel}`}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart({
  data,
  tone,
  valueFormatter = formatNumber,
}: {
  data: AnalyticsCategoryPoint[];
  tone: "primary" | "secondary" | "accent";
  valueFormatter?: (value: number) => string;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const barClass = tone === "primary" ? "bg-primary" : tone === "secondary" ? "bg-sky-500" : "bg-emerald-500";

  return (
    <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/60 p-4">
      <div className="grid items-end gap-2 min-w-[560px]" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
        {data.map((item) => {
          const height = maxValue > 0 ? Math.max(8, (item.value / maxValue) * 100) : 0;

          return (
            <div key={item.label} className="flex min-w-0 flex-col items-center gap-2">
              <div className="flex h-36 w-full items-end">
                <div className={`w-full rounded-t-md ${barClass}`} style={{ height: `${height}%` }} />
              </div>
              <div className="text-xs font-semibold text-foreground">{valueFormatter(item.value)}</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CompactHourHeatmap({
  data,
}: {
  data: AnalyticsCategoryPoint[];
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-background/60 p-4">
        <div className="grid grid-cols-6 gap-2">
          {data.map((item) => {
            const intensity = maxValue > 0 ? item.value / maxValue : 0;
            const shade =
              intensity >= 0.8 ? "bg-sky-500" : intensity >= 0.55 ? "bg-sky-400" : intensity >= 0.3 ? "bg-sky-300" : "bg-sky-200";

            return (
              <div key={item.label} className="space-y-1">
                <div
                  className={`flex h-16 items-end justify-center rounded-md border border-border/60 ${item.value > 0 ? shade : "bg-muted/40"} text-[10px] font-semibold text-foreground/80`}
                  title={`${item.label}: ${formatNumber(item.value)} appointments`}
                >
                  {item.value > 0 ? formatNumber(item.value) : ""}
                </div>
                <div className="text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Low volume</span>
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-sky-200" />
          <span className="size-3 rounded-sm bg-sky-300" />
          <span className="size-3 rounded-sm bg-sky-400" />
          <span className="size-3 rounded-sm bg-sky-500" />
        </div>
        <span>High volume</span>
      </div>
    </div>
  );
}

function buildTwoHourSeries(data: AnalyticsCategoryPoint[]) {
  if (data.length === 0) return [];

  const localHours = Array.from({ length: 24 }, () => 0);
  const referenceDate = new Date();

  for (let hour = 0; hour < 24; hour += 1) {
    referenceDate.setUTCHours(hour, 0, 0, 0);
    const localHour = referenceDate.getHours();
    localHours[localHour] += data[hour]?.value ?? 0;
  }

  const buckets: AnalyticsCategoryPoint[] = [];

  for (let hour = 0; hour < 24; hour += 2) {
    const first = localHours[hour] ?? 0;
    const second = localHours[hour + 1] ?? 0;
    buckets.push({
      label: `${String(hour).padStart(2, "0")}-${String(hour + 1).padStart(2, "0")}`,
      value: first + second,
    });
  }

  return buckets;
}

function buildTrendPoints(values: number[]) {
  if (values.length === 0) return [];

  const maxValue = Math.max(...values, 1);
  const left = 6;
  const right = 96;
  const top = 8;
  const bottom = 52;
  return values.map((value, index) => ({
    x: values.length === 1 ? (left + right) / 2 : left + (index / (values.length - 1)) * (right - left),
    y: bottom - (value / maxValue) * (bottom - top),
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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

function formatTrendDateLabel(value?: string) {
  if (!value) return "N/A";
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTrendTick(value: number, valueFormatter?: (value: number) => string) {
  const normalized = Number.isFinite(value) ? value : 0;
  return valueFormatter ? valueFormatter(normalized) : formatNumber(Math.round(normalized));
}

function formatMonthRange(data: AnalyticsCategoryPoint[]) {
  if (data.length === 0) return "Current year to date";
  if (data.length === 1) return `${data[0]?.label ?? "N/A"} ${new Date().getFullYear()}`;

  return `${data[0]?.label ?? "N/A"} - ${data.at(-1)?.label ?? "N/A"} ${new Date().getFullYear()}`;
}

function StatBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function buildYAxisTicks(maxValue: number) {
  const ceiling = Math.max(1, Math.ceil(maxValue));
  const step = Math.max(1, Math.ceil(ceiling / 3));
  const values = [ceiling, Math.max(0, ceiling - step), Math.max(0, ceiling - step * 2), 0];

  const uniqueValues = values.filter((value, index) => values.indexOf(value) === index);
  const positions = [8, 22, 36, 50];

  return uniqueValues.map((value, index) => ({
    value,
    y: positions[index] ?? positions[positions.length - 1],
  }));
}


