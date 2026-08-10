"use client";

import { cn } from "@/lib/utils";
import { toDayKey } from "../scheduling-datetime";

interface WeeklyCalendarDaysHeaderProps {
  weekDays: Date[];
  /** Day key of today, or `null` before mount. */
  todayKey: string | null;
}

/**
 * Sticky day row. It lives inside the same min-width track as the grid so the
 * two stay aligned when the calendar scrolls horizontally on narrow screens.
 */
export function WeeklyCalendarDaysHeader({
  weekDays,
  todayKey,
}: WeeklyCalendarDaysHeaderProps) {
  return (
    <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-card">
      <div className="flex items-center justify-center border-r border-border p-3">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground">
          Time
        </span>
      </div>

      {weekDays.map((day) => {
        const isToday = toDayKey(day) === todayKey;

        return (
          <div
            key={toDayKey(day)}
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
              {day.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span
              className={cn(
                "mt-1 text-xl font-bold leading-none",
                isToday
                  ? "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {day.getDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
