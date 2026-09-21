"use client";

import { Appointment } from "../../../domain/model/entities/appointment";
import { cn } from "@/lib/utils";
import { formatTimeInTimeZone } from "../scheduling-timezone.utils";

import { useSchedulingTranslations } from "../../i18n";

interface AppointmentBlockProps {
  appointment: Appointment;
  now: number | null;
  timeZone: string;
  onClick: () => void;
}

function getStatusStyles(appointment: Appointment, now: number | null) {
  switch (appointment.status) {
    case "CANCELLED":
      return "border-destructive/20 bg-destructive/5 text-destructive/80 line-through opacity-60";
    case "NO_SHOW":
      return "border-muted-foreground/20 bg-muted text-muted-foreground opacity-70";
    case "COMPLETED":
      return "border-primary/20 bg-primary/5 text-primary/70";
    case "IN_PROGRESS":
      return "border-primary bg-primary/15 text-primary";
    case "CONFIRMED": {
      const isOverdue = now !== null && new Date(appointment.startsAt).getTime() < now;
      return isOverdue
        ? "border-primary/50 bg-primary/10 text-primary"
        : "border-primary/20 bg-primary/5 text-primary";
    }
    default:
      return "border-border bg-muted/40 text-muted-foreground";
  }
}

export function AppointmentBlock({ appointment, now, timeZone, onClick }: AppointmentBlockProps) {
  const { t, locale } = useSchedulingTranslations();
  const starts = new Date(appointment.startsAt);
  const ends = new Date(appointment.endsAt);
  const timeRange = `${formatTimeInTimeZone(starts, timeZone, locale)} - ${formatTimeInTimeZone(ends, timeZone, locale)}`;

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
      aria-label={`${getStatusLabel(appointment.status)}: ${appointment.title}, ${timeRange}`}
      className={cn(
        "w-full rounded-lg border p-2 text-left transition-[transform,box-shadow] min-w-0 overflow-hidden",
        "hover:-translate-y-0.5 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        getStatusStyles(appointment, now)
      )}
    >
      <span className="block truncate text-xs font-bold leading-snug">{appointment.title}</span>
      <span className="mt-0.5 block text-[10px] font-medium opacity-80">{timeRange}</span>
    </button>
  );
}
