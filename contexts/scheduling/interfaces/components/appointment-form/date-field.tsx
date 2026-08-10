"use client";

import { useMemo, useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/contexts/shared/interfaces/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  addMonths,
  isSameDay,
  parseDateInputValue,
  startOfMonth,
  toDateInputValue,
} from "../scheduling-datetime";
import { useNow } from "../use-now";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;
const GRID_CELLS = 42;

interface DateFieldProps {
  id: string;
  name?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /** Earliest selectable day, as `YYYY-MM-DD`. Earlier days render disabled. */
  min?: string;
}

/** Six full weeks starting on Monday, so the grid never changes height. */
function buildMonthGrid(month: Date): Date[] {
  const firstDay = startOfMonth(month);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - leadingDays);

  return Array.from({ length: GRID_CELLS }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function DateField({ id, name, placeholder, value, onChange, min }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = parseDateInputValue(value);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selectedDate ?? new Date())
  );

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const minDate = min ? parseDateInputValue(min) : null;
  // `null` until mounted, so the "today" ring never causes a hydration mismatch.
  const now = useNow();
  const today = now === null ? null : new Date(now);

  const handleOpenChange = (open: boolean) => {
    // Reopening always lands on the selected month rather than wherever the
    // user browsed to last time.
    if (open) setVisibleMonth(startOfMonth(parseDateInputValue(value) ?? new Date()));
    setIsOpen(open);
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          id={id}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between gap-3 px-3 text-left font-normal"
          )}
        >
          <span className={cn("truncate", !selectedDate && "text-muted-foreground")}>
            {selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto gap-0 p-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <div aria-live="polite" className="text-sm font-medium">
              {visibleMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div
            role="grid"
            aria-label={visibleMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          >
            <div role="row" className="grid grid-cols-7 gap-1 pb-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  role="columnheader"
                  className="text-center text-[11px] font-semibold tracking-wide text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthGrid.map((day) => {
                const dayValue = toDateInputValue(day);
                const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                const isDisabled = minDate ? day < minDate : false;
                const isToday = today ? isSameDay(day, today) : false;

                return (
                  // A plain button keeps 42 cells cheap; the styled `Button`
                  // component would mount 42 variant-resolving wrappers.
                  <button
                    key={dayValue}
                    type="button"
                    role="gridcell"
                    disabled={isDisabled}
                    aria-selected={isSelected}
                    aria-label={day.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    onClick={() => {
                      onChange(dayValue);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "size-9 rounded-lg text-sm outline-none transition-colors",
                      "hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                      "disabled:pointer-events-none disabled:opacity-30",
                      isCurrentMonth ? "text-foreground" : "text-muted-foreground/40",
                      isToday && !isSelected && "ring-1 ring-primary/40 text-primary",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
