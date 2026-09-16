"use client";

import React, { useState, useTransition, useEffect } from "react";
import type { StandardAnalyticsDashboardResponse } from "../../rest/schemas/standard-analytics.schemas";
import type { AnalyticsPreset } from "../../../domain/model/value-objects/analytics-date-range";
import { AnalyticsExportService } from "../../../domain/services/analytics-export.service";
import { fetchStandardAnalyticsAction } from "../../actions/get-analytics-dashboard.action";
import { AnalyticsDatePicker } from "../shared/analytics-date-picker";
import { KpiCard } from "../shared/kpi-card";
import { useAnalyticsTranslations } from "../../i18n";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/contexts/shared/interfaces/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/contexts/shared/interfaces/components/ui/table";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  DollarSign,
  Bot,
  Activity,
  Layers,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

export interface StandardAnalyticsViewProps {
  initialData: StandardAnalyticsDashboardResponse;
  organizationId?: string;
  establishmentId?: string;
  establishmentName?: string;
  onPresetChange?: (preset: AnalyticsPreset) => void;
  activePreset?: AnalyticsPreset;
}

export function StandardAnalyticsView({
  initialData,
  organizationId,
  establishmentId,
  establishmentName,
  onPresetChange,
  activePreset = "30d",
}: StandardAnalyticsViewProps) {
  const { t } = useAnalyticsTranslations();
  const [data, setData] = useState<StandardAnalyticsDashboardResponse>(initialData);
  const [currentPreset, setCurrentPreset] = useState<AnalyticsPreset>(activePreset);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handlePresetChange = (preset: AnalyticsPreset) => {
    setCurrentPreset(preset);
    onPresetChange?.(preset);
    startTransition(async () => {
      try {
        const updated = await fetchStandardAnalyticsAction(preset, organizationId, establishmentId);
        setData(updated);
      } catch (err) {
        console.error("Failed to load preset analytics:", err);
      }
    });
  };

  const handleExport = () => {
    try {
      setIsExporting(true);
      const headers = ["Fecha", "Citas Completadas", "Canceladas"];
      const rows = data.completionVsCancellationTrend.map((pt) => [
        pt.date,
        pt.primaryValue,
        pt.secondaryValue,
      ]);
      const csv = AnalyticsExportService.toCsvWithBom(headers, rows);
      AnalyticsExportService.triggerDownload(
        `analiticas-standard-${data.from}-${data.to}.csv`,
        csv
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formattedGrossRevenue = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "USD",
  }).format(data.grossRevenue);

  return (
    <div className={cn("space-y-6 transition-opacity duration-200", isPending && "opacity-60 pointer-events-none")}>
      {/* Header Controls */}
      <AnalyticsDatePicker
        currentPreset={currentPreset}
        onPresetChange={handlePresetChange}
        isExporting={isExporting}
        onExport={handleExport}
        maxDays={30}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={t.metrics.totalAppointments}
          value={data.totalAppointments}
          subtitle={`${data.inProgressAppointments} ${t.subtitles.inProgress}`}
          icon={CalendarDays}
        />
        <KpiCard
          title={t.metrics.completedAppointments}
          value={data.completedAppointments}
          subtitle={`${((data.completedAppointments / (data.totalAppointments || 1)) * 100).toFixed(0)}% ${t.subtitles.totalShare}`}
          icon={CheckCircle2}
        />
        <KpiCard
          title={t.metrics.cancelledAppointments}
          value={data.cancelledAppointments}
          subtitle={`${data.noShowAppointments} ${t.subtitles.noShowsCount}`}
          icon={XCircle}
        />
        <KpiCard
          title={t.metrics.grossRevenue}
          value={formattedGrossRevenue}
          subtitle={t.subtitles.collectedRevenue}
          icon={DollarSign}
        />
      </div>

      {/* Main Trend Charts */}
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
                  <linearGradient id="appointmentsGrad" x1="0" y1="0" x2="0" y2="1">
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
                  fill="url(#appointmentsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Completed vs Cancelled Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">
                  {t.charts.completionVsCancellation}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t.subtitles.dailyEffectiveness}
                </CardDescription>
              </div>
              <Layers className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.completionVsCancellationTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="primaryValue" name={t.metrics.completedAppointments} fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="secondaryValue" name={t.metrics.cancelledAppointments} fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Services & Assistant Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 5 Services */}
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
                        {new Intl.NumberFormat("es-PE", { style: "currency", currency: "USD" }).format(service.grossRevenue)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Assistant Activity & Cancellation reasons */}
        <div className="space-y-6">
          {/* Bot Activity Widget */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bot className="size-4 text-primary" />
                  {t.botRoi.title}
                </CardTitle>
                <Badge variant="secondary" className="text-[10px]">{t.subtitles.aiBadge}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">{t.botRoi.conversationsHandled}</span>
                <span className="text-base font-bold text-foreground">{data.assistantChatsCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                <span className="text-xs text-muted-foreground">{t.botRoi.appointmentsGenerated}</span>
                <span className="text-base font-bold text-emerald-600">{data.assistantAppointmentsCreatedCount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Reasons summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                {t.charts.cancellationReasons}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              {data.cancellationReasons.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">{t.subtitles.noCancellations}</p>
              ) : (
                data.cancellationReasons.map((item) => (
                  <div key={item.reason} className="flex items-center justify-between text-xs">
                    <span className="truncate text-muted-foreground max-w-[160px]">{item.reason}</span>
                    <span className="font-semibold text-foreground">{item.count} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
