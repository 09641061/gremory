"use client";

import { useState } from "react";

import type { AnalyticsTrendPoint } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import {
  buildArea,
  buildPolyline,
  buildTrendPoints,
  buildYAxisTicks,
  formatNumber,
  formatTrendDateLabel,
  formatTrendRange,
  formatTrendTick,
} from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

export function TrendChart({
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
