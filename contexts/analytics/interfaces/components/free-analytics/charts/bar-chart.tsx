import type { AnalyticsCategoryPoint } from "@/contexts/analytics/interfaces/view-models/free-analytics.view-model";
import { formatNumber } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

export function BarChart({
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
