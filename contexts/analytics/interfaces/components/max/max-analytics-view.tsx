"use client";

import React, { useState, useTransition } from "react";
import type { MaxAnalyticsDashboardResponse } from "../../../infrastructure/contracts/max-analytics.schemas";
import type { AnalyticsPreset } from "../../../domain/model/value-objects/analytics-date-range";
import { AnalyticsExportService } from "../../../domain/services/analytics-export.service";
import { fetchMaxAnalyticsAction } from "../../actions/get-analytics-dashboard.action";
import { AnalyticsDatePicker } from "../shared/analytics-date-picker";
import { KpiCard } from "../shared/kpi-card";
import { useAnalyticsI18n } from "../../i18n";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/contexts/shared/interfaces/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/contexts/shared/interfaces/components/ui/tabs";
import {
  CalendarDays,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Bot,
  Users,
  ShieldAlert,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export interface MaxAnalyticsViewProps {
  initialData: MaxAnalyticsDashboardResponse;
  organizationId?: string;
  establishmentId?: string;
  onPresetChange?: (preset: AnalyticsPreset) => void;
  activePreset?: AnalyticsPreset;
}

export function MaxAnalyticsView({
  initialData,
  organizationId,
  establishmentId,
  onPresetChange,
  activePreset = "30d",
}: MaxAnalyticsViewProps) {
  const { t, locale } = useAnalyticsI18n();
  const [data, setData] = useState<MaxAnalyticsDashboardResponse>(initialData);
  const [currentPreset, setCurrentPreset] = useState<AnalyticsPreset>(activePreset);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const handlePresetChange = (preset: AnalyticsPreset) => {
    setCurrentPreset(preset);
    onPresetChange?.(preset);
    startTransition(async () => {
      try {
        const updated = await fetchMaxAnalyticsAction(preset, organizationId, establishmentId);
        setData(updated);
      } catch (err) {
        console.error("Failed to load preset max analytics:", err);
      }
    });
  };

  const handleExport = () => {
    try {
      setIsExporting(true);
      const headers = [
        t.export.csvHeaders.date,
        t.export.csvHeaders.billedRevenue,
        t.export.csvHeaders.totalAppointments,
      ];
      const rows = data.revenueTrend.map((pt, idx) => [
        pt.date,
        pt.value,
        data.appointmentsTrend[idx]?.value || 0,
      ]);
      const csv = AnalyticsExportService.toCsvWithBom(headers, rows);
      AnalyticsExportService.triggerDownload(
        `${t.export.filePrefixMax}-${data.from}-${data.to}.csv`,
        csv
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale === "es" ? "es-PE" : "en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div className={cn("space-y-6", isPending && "opacity-60 pointer-events-none transition-opacity")}>
      {/* Date controls and Export */}
      <AnalyticsDatePicker
        currentPreset={currentPreset}
        onPresetChange={handlePresetChange}
        isExporting={isExporting}
        onExport={handleExport}
        maxDays={90}
      />

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t.metrics.grossRevenue}
          value={formatCurrency(data.grossRevenue)}
          growthPercentage={data.periodComparison.revenueGrowthPercentage}
          subtitle={`${t.subtitles.previousPeriod}: ${formatCurrency(data.periodComparison.previousPeriodRevenue)}`}
          icon={DollarSign}
        />
        <KpiCard
          title={t.metrics.totalAppointments}
          value={data.totalAppointments}
          growthPercentage={data.periodComparison.appointmentsGrowthPercentage}
          subtitle={`${data.completedAppointments} ${t.subtitles.completedCount} | ${data.cancelledAppointments} ${t.subtitles.cancelledCount}`}
          icon={CalendarDays}
        />
        <KpiCard
          title={t.metrics.lostRevenue}
          value={formatCurrency(data.lostRevenue.totalLostRevenue)}
          subtitle={`${t.subtitles.cancellations}: ${formatCurrency(data.lostRevenue.cancelledLostRevenue)} | ${t.subtitles.noShows}: ${formatCurrency(data.lostRevenue.noShowLostRevenue)}`}
          icon={AlertTriangle}
          highlightVariant="destructive"
        />
        <KpiCard
          title={t.botRoi.attributedRevenue}
          value={formatCurrency(data.botRoi.grossRevenueAttributed)}
          subtitle={`${t.subtitles.convRate} ${data.botRoi.conversionRate.toFixed(1)}% (${data.botRoi.appointmentsCreatedCount} ${t.subtitles.appointments})`}
          icon={Bot}
          highlightVariant="success"
        />
      </div>

      {/* Charts Section: Daily Appointments Flow & Daily Revenue Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Appointments Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  {t.charts.dailyFlow}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.charts.appointmentTrend}
                </CardDescription>
              </div>
              <Activity className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.appointmentsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maxAppointmentsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={t.metrics.totalAppointments}
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#maxAppointmentsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  {t.charts.dailyRevenue}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.charts.dailyRevenue}
                </CardDescription>
              </div>
              <TrendingUp className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-[10px] text-muted-foreground" />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val}`}
                  className="text-[10px] text-muted-foreground"
                />
                <Tooltip
                  formatter={(value: unknown) => [formatCurrency(Number(value) || 0), t.subtitles.billing]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Services & Customer Loyalty */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Services */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t.charts.topServices}
            </CardTitle>
            <CardDescription className="text-xs">
              {t.subtitles.topServicesSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">{t.frictionMatrix.serviceName}</TableHead>
                  <TableHead>{t.frictionMatrix.categoryName}</TableHead>
                  <TableHead className="text-center">{t.metrics.completedAppointments}</TableHead>
                  <TableHead className="text-right">{t.metrics.grossRevenue}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                      {t.state.emptyTitle}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.topServices.map((service, idx) => (
                    <TableRow key={service.serviceId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <span className="truncate">{service.serviceName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {service.categoryName || "—"}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {service.completedCount}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(service.grossRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Customer Loyalty & Retention Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              {t.loyalty.title}
            </CardTitle>
            <CardDescription className="text-xs">
              {t.loyalty.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-xs text-muted-foreground">{t.loyalty.newCustomers}</span>
              <span className="text-sm font-bold text-foreground">{data.customerRetention.newCustomersCount}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2.5">
              <span className="text-xs text-muted-foreground">{t.loyalty.recurringCustomers}</span>
              <span className="text-sm font-bold text-foreground">{data.customerRetention.recurringCustomersCount}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-primary/10 p-2.5">
              <span className="text-xs font-semibold text-primary">{t.subtitles.retentionRate}</span>
              <span className="text-base font-bold text-primary">{data.customerRetention.retentionRate.toFixed(1)}%</span>
            </div>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.loyalty.topCustomers}
              </span>
              <div className="space-y-1.5">
                {data.topCustomersBySpend.slice(0, 3).map((c) => (
                  <div key={c.customerId} className="flex items-center justify-between text-xs">
                    <span className="truncate font-medium">{c.customerName}</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(c.totalSpend)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deep-dive Tabs: Service Friction Matrix & Workforce Productivity */}
      <Tabs defaultValue="friction" className="space-y-4">
        <TabsList>
          <TabsTrigger value="friction" className="gap-2">
            <ShieldAlert className="size-4" />
            {t.frictionMatrix.title}
          </TabsTrigger>
          <TabsTrigger value="workforce" className="gap-2">
            <Users className="size-4" />
            {t.workforce.title}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Service Friction Matrix */}
        <TabsContent value="friction">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t.frictionMatrix.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {t.frictionMatrix.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">{t.frictionMatrix.serviceName}</TableHead>
                    <TableHead>{t.frictionMatrix.categoryName}</TableHead>
                    <TableHead className="text-center">{t.frictionMatrix.totalBookings}</TableHead>
                    <TableHead className="text-center">{t.frictionMatrix.cancellationRate}</TableHead>
                    <TableHead className="text-center">{t.frictionMatrix.noShowRate}</TableHead>
                    <TableHead className="text-right">{t.subtitles.diagnosis}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.serviceFrictionMatrix.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                        {t.state.emptyTitle}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.serviceFrictionMatrix.map((item) => {
                      const isHighRisk = item.cancellationRate > 25 || item.noShowRate > 15;
                      const isMediumRisk = item.cancellationRate > 15 || item.noShowRate > 8;

                      return (
                        <TableRow key={item.serviceId}>
                          <TableCell className="font-medium">{item.serviceName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.categoryName || "—"}</TableCell>
                          <TableCell className="text-center font-semibold">{item.totalBookings}</TableCell>
                          <TableCell className="text-center font-medium">
                            {item.cancellationRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-center font-medium">
                            {item.noShowRate.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            {isHighRisk ? (
                              <Badge variant="destructive" className="text-[11px]">
                                {t.frictionMatrix.riskHigh}
                              </Badge>
                            ) : isMediumRisk ? (
                              <Badge variant="outline" className="border-amber-500/50 text-amber-600 text-[11px]">
                                {t.frictionMatrix.riskMedium}
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-emerald-600 text-[11px]">
                                {t.frictionMatrix.riskLow}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Workforce Productivity */}
        <TabsContent value="workforce">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                {t.workforce.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {t.workforce.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">{t.workforce.specialist}</TableHead>
                    <TableHead className="text-center">{t.workforce.completed}</TableHead>
                    <TableHead className="text-center">{t.workforce.cancelled}</TableHead>
                    <TableHead className="text-center">{t.workforce.completionRate}</TableHead>
                    <TableHead className="text-right">{t.workforce.revenue}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.workforceProductivity.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                        {t.state.emptyTitle}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.workforceProductivity.map((wf) => (
                      <TableRow key={wf.workforceMemberId}>
                        <TableCell className="font-semibold">{wf.memberName}</TableCell>
                        <TableCell className="text-center font-medium text-emerald-600">
                          {wf.completedAppointments}
                        </TableCell>
                        <TableCell className="text-center font-medium text-rose-600">
                          {wf.cancelledAppointments}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {wf.completionRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(wf.grossRevenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
