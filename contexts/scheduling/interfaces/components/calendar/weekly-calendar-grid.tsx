"use client";

import { useMemo } from "react";
import { Appointment } from "../../../domain/model/entities/appointment";
import { Skeleton } from "@/contexts/shared/interfaces/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AppointmentBlock } from "./appointment-block";
import { toTimeZoneDayKey } from "../scheduling-timezone.utils";

const ROW_MIN_HEIGHT = 80;
const CARD_HEIGHT = 72;
const ROW_PADDING = 16;

interface WeeklyCalendarGridProps {
  appointments: Appointment[];
  weekDays: Date[];
  hours: number[];
  isPending: boolean;
  todayKey: string | null;
  now: number | null;
  timeZone: string;
  onAppointmentClick: (appointment: Appointment) => void;
}

function formatHour(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function WeeklyCalendarGrid({
  appointments,
  weekDays,
  hours,
  isPending,
  todayKey,
  now,
  timeZone,
  onAppointmentClick,
}: WeeklyCalendarGridProps) {
  const appointmentsByCell = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const dayKey = toTimeZoneDayKey(new Date(appointment.startsAt), timeZone);
      const starts = new Date(appointment.startsAt);
      const key = `${dayKey}-${starts.getHours()}`;
      const bucket = map.get(key);
      if (bucket) bucket.push(appointment);
      else map.set(key, [appointment]);
    }
    return map;
  }, [appointments, timeZone]);

  if (isPending) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="select-none">
      {hours.map((hour) => {
        const busiestDay = weekDays.reduce((max, day) => {
          const dayKey = toTimeZoneDayKey(day, timeZone);
          const count = appointmentsByCell.get(`${dayKey}-${hour}`)?.length ?? 0;
          return Math.max(max, count);
        }, 0);
        const rowHeight = Math.max(ROW_MIN_HEIGHT, busiestDay * CARD_HEIGHT + ROW_PADDING);

        return (
          <div
            key={hour}
            className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-border"
            style={{ minHeight: rowHeight }}
          >
            <div className="border-r border-border pt-2 text-center text-[10px] font-semibold text-muted-foreground">
              {formatHour(hour)}
            </div>

            {weekDays.map((day) => {
              const dayKey = toTimeZoneDayKey(day, timeZone);
              const cellAppointments = appointmentsByCell.get(`${dayKey}-${hour}`) ?? [];

              return (
                <div
                  key={dayKey}
                  className={cn(
                    "flex flex-col gap-2 border-r border-border p-1 last:border-r-0",
                    dayKey === todayKey && "bg-primary/5"
                  )}
                >
                  {cellAppointments.map((appointment) => (
                    <AppointmentBlock
                      key={appointment.id}
                      appointment={appointment}
                      now={now}
                      timeZone={timeZone}
                      onClick={() => onAppointmentClick(appointment)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
