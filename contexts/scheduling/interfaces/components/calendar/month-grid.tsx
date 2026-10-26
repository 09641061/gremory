"use client";

import {
  SchedulingCustomerViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { Appointment } from "../../../domain/model/entities/appointment";
import {
  addCalendarDays,
  getTimeZoneParts,
  toTimeZoneDayKey,
  formatTimeInTimeZone,
} from "../scheduling-timezone.utils";
import { cn } from "@/lib/utils";

interface MonthGridProps {
  currentDate: Date;
  appointments: Appointment[];
  timeZone: string;
  now: number | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onDayClick?: (date: Date) => void;
  customers?: SchedulingCustomerViewModel[];
  services?: SchedulingServiceViewModel[];
  selectedAppointmentId?: string | null;
}

function getStatusPillClasses(status: Appointment["status"], isSelected: boolean) {
  if (isSelected) {
    return "border-primary bg-primary/20 text-primary font-semibold ring-1 ring-primary";
  }
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/15 text-emerald-900 dark:text-emerald-200";
    case "IN_PROGRESS":
      return "border-amber-400/60 bg-amber-500/15 text-amber-950 dark:text-amber-100";
    case "CANCELLED":
      return "border-dashed border-destructive/40 bg-destructive/5 text-muted-foreground line-through opacity-70";
    case "NO_SHOW":
      return "border-border bg-muted/60 text-muted-foreground opacity-75";
    case "CONFIRMED":
    default:
      return "border-border bg-card text-foreground hover:border-primary/50";
  }
}

export function MonthGrid({
  currentDate,
  appointments,
  timeZone,
  now,
  onAppointmentClick,
  onDayClick,
  customers = [],
  selectedAppointmentId = null,
}: MonthGridProps) {
  const currentMonth = currentDate.getUTCMonth();
  const currentYear = currentDate.getUTCFullYear();

  const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1, 12, 0, 0, 0));
  const startDayOfWeek = firstDay.getUTCDay();
  const startOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
  const gridStart = addCalendarDays(firstDay, startOffset);

  // Generate 42 cells (6 weeks × 7 days)
  const totalDays = 42;
  const days = Array.from({ length: totalDays }, (_, i) => addCalendarDays(gridStart, i));

  // Chunk into 6 rows of 7 days
  const weeks: Date[][] = [];
  for (let i = 0; i < totalDays; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const nowKey = now !== null ? toTimeZoneDayKey(new Date(now), timeZone) : null;

  const getAppointmentsForDay = (day: Date) => {
    const dayKey = toTimeZoneDayKey(day, timeZone);
    return appointments.filter((apt) => {
      const aptKey = toTimeZoneDayKey(new Date(apt.startsAt), timeZone);
      return aptKey === dayKey;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background rounded-b-xl border border-t-0 w-full">
      {weeks.map((week, weekIndex) => (
        <div
          key={`week-${weekIndex}`}
          className="grid grid-cols-7 divide-x border-b last:border-b-0 min-h-[105px] flex-1"
        >
          {week.map((day) => {
            const dayKey = toTimeZoneDayKey(day, timeZone);
            const isToday = dayKey === nowKey;
            const dayParts = getTimeZoneParts(day, timeZone);
            const isCurrentMonth = dayParts.month === currentMonth + 1;
            const dayAppointments = getAppointmentsForDay(day);

            return (
              <div
                key={dayKey}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    onDayClick?.(day);
                  }
                }}
                className={cn(
                  "relative flex flex-col p-1.5 min-w-0 transition-colors hover:bg-muted/10 cursor-pointer",
                  !isCurrentMonth && "bg-muted/5 opacity-60"
                )}
              >
                {/* Header with day number */}
                <div className="flex items-center justify-between pb-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isToday
                        ? "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold shadow-xs"
                        : isCurrentMonth
                          ? "text-foreground"
                          : "text-muted-foreground"
                    )}
                  >
                    {dayParts.day}
                  </span>
                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                {/* Appointments pills list */}
                <div className="flex flex-col gap-1 overflow-hidden pointer-events-none">
                  {dayAppointments.slice(0, 3).map((apt) => {
                    const customer = customers.find((c) => c.id === apt.customerId);
                    const displayName = customer?.name || apt.title;
                    const startTime = formatTimeInTimeZone(new Date(apt.startsAt), timeZone);
                    const isSelected = selectedAppointmentId === apt.id;

                    return (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                        className={cn(
                          "pointer-events-auto flex items-center gap-1 w-full rounded border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-transform hover:-translate-y-0.2 hover:shadow-xs truncate",
                          getStatusPillClasses(apt.status, isSelected)
                        )}
                        title={`${startTime} ${displayName}`}
                      >
                        <span className="font-semibold shrink-0 text-[10px] opacity-75">
                          {startTime}
                        </span>
                        <span className="truncate">{displayName}</span>
                      </button>
                    );
                  })}
                  {dayAppointments.length > 3 && (
                    <span className="text-[10px] font-medium text-muted-foreground pl-1">
                      +{dayAppointments.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
