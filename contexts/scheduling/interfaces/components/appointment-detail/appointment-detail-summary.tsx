"use client";

import { CalendarCheck, Tag } from "lucide-react";

interface AppointmentDetailSummaryProps {
  title: string;
  serviceName: string;
  statusLabel: string;
  statusClassName: string;
}

export function AppointmentDetailSummary({
  title,
  serviceName,
  statusLabel,
  statusClassName,
}: AppointmentDetailSummaryProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck className="text-primary size-5 shrink-0" />
          <h3 className="text-lg font-semibold leading-tight text-foreground break-words break-all min-w-0 flex-1">{title}</h3>
        </div>
        <div className="text-sm text-muted-foreground flex items-center justify-between gap-1.5 mt-2 bg-muted/20 p-2 rounded-lg border border-border">
          <div className="flex items-center gap-1.5">
            <Tag className="size-3.5 text-muted-foreground" />
            <span>
              Service: <span className="font-medium text-foreground">{serviceName}</span>
            </span>
          </div>
        </div>
      </div>

      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClassName}`}
      >
        {statusLabel}
      </span>
    </div>
  );
}
