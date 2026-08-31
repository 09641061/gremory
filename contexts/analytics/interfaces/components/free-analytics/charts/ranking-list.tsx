import type { ReactNode } from "react";

import { ListOrdered } from "lucide-react";

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/contexts/shared/interfaces/components/ui/empty";
import { formatNumber } from "@/contexts/analytics/interfaces/components/free-analytics/free-analytics.utils";

export function RankingList<T>({
  items,
  emptyLabel,
  renderItem,
}: {
  items: ReadonlyArray<T>;
  emptyLabel: string;
  renderItem: (item: T) => ReactNode;
}) {
  if (items.length === 0) {
    return (
      <Empty className="border-border/70 bg-background/70 py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ListOrdered />
          </EmptyMedia>
          <EmptyContent>
            <EmptyTitle>No data yet</EmptyTitle>
            <EmptyDescription>{emptyLabel}</EmptyDescription>
          </EmptyContent>
        </EmptyHeader>
      </Empty>
    );
  }

  return <div className="space-y-2">{items.map((item, index) => <div key={index}>{renderItem(item)}</div>)}</div>;
}

export function RankingRow({
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

export function RateRankingRow({
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
