import type { AnalyticsTrendPoint } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import {
  buildArea,
  buildPolyline,
  buildTrendPoints,
  formatNumber,
  formatTrendDateLabel,
  formatTrendRange,
} from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

type ComparisonSeries = {
  label: string;
  data: AnalyticsTrendPoint[];
  tone: "text-success" | "text-destructive";
};

export function ComparisonTrendChart({ series }: { series: ComparisonSeries[] }) {
  const maxValue = Math.max(...series.flatMap((item) => item.data.map((point) => point.value)), 1);
  const firstSeries = series[0]?.data ?? [];
  const pointsBySeries = series.map((item) => ({
    ...item,
    points: buildTrendPoints(item.data.map((point) => (point.value / maxValue) * maxValue)),
  }));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{formatTrendRange(firstSeries[0]?.date, firstSeries.at(-1)?.date)}</span>
        <div className="flex flex-wrap gap-3">
          {series.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full bg-current ${item.tone}`} />
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-background/60 p-4">
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="h-52 w-full">
          <line x1="6" y1="52" x2="96" y2="52" stroke="currentColor" className="text-border/70" />
          {pointsBySeries.map((item) => (
            <g key={item.label} className={item.tone}>
              <path d={buildArea(item.points)} fill="currentColor" fillOpacity="0.06" />
              <polyline points={buildPolyline(item.points)} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
              {item.points.map((point, index) => (
                <circle
                  key={`${item.label}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="1.8"
                  fill="currentColor"
                  role="img"
                  aria-label={`${item.label} ${formatTrendDateLabel(item.data[index]?.date)}: ${formatNumber(item.data[index]?.value ?? 0)}`}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
