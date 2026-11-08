"use client";

import { useSchedulingTranslations } from "../../i18n";
import { addCalendarDays, getTimeZoneParts, toTimeZoneDayKey } from "../scheduling-timezone.utils";
import { cn } from "@/lib/utils";

interface WeekColumnsHeaderProps {
  currentDate: Date;
  timeZone: string;
  now: number | null;
}

export function WeekColumnsHeader({ currentDate, timeZone, now }: WeekColumnsHeaderProps) {
  const { locale } = useSchedulingTranslations();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";

  const dayOfWeek = currentDate.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addCalendarDays(currentDate, mondayOffset);

  const days = Array.from({ length: 7 }, (_, i) => addCalendarDays(monday, i));

  const nowKey = now !== null ? toTimeZoneDayKey(new Date(now), timeZone) : null;

  return (
    <div className="flex w-full items-center">
      {/* Spacer matching the time labels column */}
      <div className="w-16 flex-shrink-0 border-r bg-muted/5 py-3 pr-2 text-right" />

      {/* 7 Day header columns */}
      <div className="grid flex-1 grid-cols-7 divide-x">
        {days.map((day) => {
          const dayKey = toTimeZoneDayKey(day, timeZone);
          const isToday = dayKey === nowKey;
          const dayParts = getTimeZoneParts(day, timeZone);
          const weekdayName = new Intl.DateTimeFormat(dateLocale, {
            timeZone,
            weekday: "short",
          }).format(day);

          const capitalizedWeekday =
            weekdayName.charAt(0).toUpperCase() + weekdayName.slice(1);

          return (
            <div
              key={dayKey}
              className={cn(
                "flex flex-col items-center justify-center py-2.5 transition-colors",
                isToday && "bg-primary/5"
              )}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {capitalizedWeekday}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                  isToday
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-foreground"
                )}
              >
                {dayParts.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
