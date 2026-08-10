"use client";

import { useMemo, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { cn } from "@/lib/utils";
import { useSelectorMenu } from "@/contexts/business/interfaces/components/use-selector-menu";
import { useAdaptivePopup } from "./use-adaptive-popup";

interface DateFieldProps {
  id: string;
  name?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function parseDateInput(value: string) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(month: Date) {
  const firstDay = startOfMonth(month);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const grid: Date[] = [];

  // Previous month days to fill startWeekday cells
  for (let i = startWeekday; i > 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(firstDay.getDate() - i);
    grid.push(prevDate);
  }

  // Current month days
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    grid.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  // Next month days to fill up to exactly 42 days (6 weeks * 7 days)
  const remainingCells = 42 - grid.length;
  const lastDay = new Date(month.getFullYear(), month.getMonth(), daysInMonth);
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(lastDay);
    nextDate.setDate(lastDay.getDate() + i);
    grid.push(nextDate);
  }

  return grid;
}

export function DateField({ id, name, placeholder, value, onChange }: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseDateInput(value) ?? new Date()));
  const selectorRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { placement, maxHeight } = useAdaptivePopup(isOpen, buttonRef);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const selectedDate = parseDateInput(value);
  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div ref={selectorRef} className="relative">
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          if (!isOpen) setVisibleMonth(startOfMonth(parseDateInput(value) ?? new Date()));
          setIsOpen((open) => !open);
        }}
        className={cn(
          "flex h-9 w-full items-center justify-between gap-3 rounded-lg border border-border bg-transparent px-3 text-left text-sm text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-muted/30",
          isOpen && "border-ring bg-card shadow-sm"
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
        <Calendar className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute left-0 z-50 w-[19rem]",
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-[0_20px_45px_rgba(15,23,42,0.18)] backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <div className="text-sm font-medium text-foreground">{monthLabel}</div>
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
            <div className="p-2" style={{ maxHeight }}>
              <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[11px] font-semibold tracking-[0.14em] text-muted-foreground">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day) => {
                  const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={formatDateInput(day)}
                      type="button"
                      onClick={() => {
                        onChange(formatDateInput(day));
                        setIsOpen(false);
                      }}
                      className={cn(
                        "h-9 rounded-xl text-sm transition-colors",
                        "hover:bg-muted/70 focus-visible:bg-muted/70 focus-visible:outline-none",
                        !isCurrentMonth && "text-muted-foreground/35 hover:text-muted-foreground/60",
                        isCurrentMonth && "text-foreground",
                        isToday && !isSelected && "bg-primary/5 text-primary",
                        isSelected && "bg-primary text-primary-foreground shadow-sm"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
