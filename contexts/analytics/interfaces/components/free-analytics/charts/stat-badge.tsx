import { formatNumber } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

export function StatBadge({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
      {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

export function StatusBar({
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

export function SplitMetricRow({
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
