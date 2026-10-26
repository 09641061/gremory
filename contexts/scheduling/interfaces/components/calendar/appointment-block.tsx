"use client";

import { Check, Clock, Play, X, CircleDashed } from "lucide-react";
import { Appointment } from "../../../domain/model/entities/appointment";
import { cn } from "@/lib/utils";
import { formatTimeInTimeZone } from "../scheduling-timezone.utils";
import { useSchedulingTranslations } from "../../i18n";

interface AppointmentBlockProps {
  appointment: Appointment;
  now: number | null;
  timeZone: string;
  onClick: () => void;
  customerName?: string;
  serviceName?: string;
  isSelected?: boolean;
}

function getStatusStyles(appointment: Appointment, isSelected?: boolean) {
  switch (appointment.status) {
    case "CANCELLED":
      return "border-dashed border-destructive/40 bg-destructive/5 text-muted-foreground line-through opacity-70";
    case "NO_SHOW":
      return "border-border bg-muted/60 text-muted-foreground opacity-75";
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-950 dark:text-emerald-100";
    case "IN_PROGRESS":
      return "border-amber-400/60 bg-amber-500/15 text-amber-950 dark:text-amber-100";
    case "CONFIRMED":
      return isSelected
        ? "border-primary bg-primary/10 ring-1 ring-primary text-foreground"
        : "border-border bg-card hover:border-border/80 text-foreground shadow-xs";
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

function StatusIcon({ status, isSelected }: { status: Appointment["status"]; isSelected?: boolean }) {
  const iconClass = "size-3 shrink-0";
  switch (status) {
    case "COMPLETED":
      return <Check className={cn(iconClass, "text-emerald-600 dark:text-emerald-400")} />;
    case "IN_PROGRESS":
      return <Play className={cn(iconClass, "text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400")} />;
    case "CANCELLED":
      return <X className={cn(iconClass, "text-destructive")} />;
    case "NO_SHOW":
      return <CircleDashed className={cn(iconClass, "text-muted-foreground")} />;
    case "CONFIRMED":
      if (isSelected) {
        return <Check className={cn(iconClass, "text-primary")} />;
      }
      return <Clock className={cn(iconClass, "text-muted-foreground")} />;
    default:
      return null;
  }
}

export function AppointmentBlock({
  appointment,
  timeZone,
  onClick,
  customerName,
  serviceName,
  isSelected = false,
}: AppointmentBlockProps) {
  const { t, locale } = useSchedulingTranslations();
  const starts = new Date(appointment.startsAt);
  const ends = new Date(appointment.endsAt);
  const timeRange = `${formatTimeInTimeZone(starts, timeZone, locale)} - ${formatTimeInTimeZone(ends, timeZone, locale)}`;

  const displayName = customerName || appointment.title;
  const displaySubtitle = serviceName || timeRange;

  const getStatusLabel = (status: Appointment["status"]): string => {
    switch (status) {
      case "CANCELLED": return t.status.cancelled;
      case "NO_SHOW": return t.status.noShow;
      case "COMPLETED": return t.status.completed;
      case "IN_PROGRESS": return t.status.inProgress;
      case "CONFIRMED": return t.status.confirmed;
      default: return status;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${getStatusLabel(appointment.status)}: ${displayName}, ${displaySubtitle}`}
      className={cn(
        "w-full rounded-lg border p-2 text-left transition-[transform,box-shadow,border-color] min-w-0 overflow-hidden",
        "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        getStatusStyles(appointment, isSelected),
        isSelected && "ring-1 ring-primary border-primary"
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="block truncate text-xs font-semibold leading-snug">{displayName}</span>
        <StatusIcon status={appointment.status} isSelected={isSelected} />
      </div>
      <span className="mt-0.5 block text-[11px] opacity-80 truncate">{displaySubtitle}</span>
    </button>
  );
}
