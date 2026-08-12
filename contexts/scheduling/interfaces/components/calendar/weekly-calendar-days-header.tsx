"use client";

import { cn } from "@/lib/utils";
import { formatCalendarWeekday, toTimeZoneDayKey } from "../scheduling-timezone.utils";

interface WeeklyCalendarDaysHeaderProps {
  weekDays: Date[];
  todayKey: string | null;
  timeZone: string;
}

export function WeeklyCalendarDaysHeader({
  weekDays,
  todayKey,
  timeZone,
}: WeeklyCalendarDaysHeaderProps) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-card">
      <div className="flex items-center justify-center border-r border-border p-3">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
          Time
        </span>
      </div>

      {weekDays.map((day) => {
        const dayKey = toTimeZoneDayKey(day, timeZone);
        const isToday = dayKey === todayKey;

        return (
          <div
            key={dayKey}
            className={cn(
              "flex flex-col items-center justify-center border-r border-border p-3 last:border-r-0",
              isToday && "bg-primary/5"
            )}
          >
            <span
              className={cn(
                "text-[11px] font-semibold",
                isToday ? "text-primary" : "text-muted-foreground"
              )}
            >
              {formatCalendarWeekday(day, timeZone)}
            </span>
            <span
              className={cn(
                "mt-1 text-xl font-bold leading-none",
                isToday
                  ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {day.getUTCDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
