"use client";

import { useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/contexts/shared/interfaces/components/ui/popover";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

interface WeeklyCalendarToolbarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onCreateAppointment: () => void;
  canCreateAppointment: boolean;
}

/** Month/year jump, week stepping and the create entry point. */
export function WeeklyCalendarToolbar({
  currentDate,
  onDateChange,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onCreateAppointment,
  canCreateAppointment,
}: WeeklyCalendarToolbarProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const currentYear = currentDate.getFullYear();

  // Year being browsed inside the popover, which is not committed until a
  // month is picked.
  const [draftYear, setDraftYear] = useState(currentYear);
  const [prevYear, setPrevYear] = useState(currentYear);
  if (currentYear !== prevYear) {
    setPrevYear(currentYear);
    setDraftYear(currentYear);
  }

  const handleOpenChange = (open: boolean) => {
    if (open) setDraftYear(currentYear);
    setIsPickerOpen(open);
  };

  const handleMonthSelect = (monthIndex: number) => {
    onDateChange(new Date(draftYear, monthIndex, 1));
    setIsPickerOpen(false);
  };

  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <Popover open={isPickerOpen} onOpenChange={handleOpenChange}>
          {/* Rendering the real `Button` keeps the shared `[data-slot=button]`
              control height from globals.css; a hand-applied `buttonVariants`
              string silently opts out of it. Fixed width stops the week
              controls from shifting as the label changes. */}
          <PopoverTrigger
            render={<Button variant="outline" />}
            className="w-44 shrink-0 justify-between px-2.5 text-lg font-semibold"
          >
            <span className="truncate">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
          </PopoverTrigger>

          <PopoverContent align="start" className="w-64 gap-0">
            <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setDraftYear((year) => year - 1)}
                aria-label="Previous year"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span aria-live="polite" className="text-sm font-semibold">
                {draftYear}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setDraftYear((year) => year + 1)}
                aria-label="Next year"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((month, index) => {
                const isSelected =
                  index === currentDate.getMonth() && draftYear === currentYear;

                return (
                  <Button
                    key={month}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "ghost"}
                    aria-current={isSelected ? "date" : undefined}
                    onClick={() => handleMonthSelect(index)}
                  >
                    {month}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* The four toolbar controls are peers: same `outline` variant, same
            `--app-control-height`. Only the square sizing is spelled out here;
            colours come from the variant. */}
        <Button
          variant="outline"
          size="icon"
          onClick={onPreviousWeek}
          aria-label="Previous week"
          className="size-(--app-control-height)"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onNextWeek}
          aria-label="Next week"
          className="size-(--app-control-height)"
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>

      {canCreateAppointment && (
        <Button size="sm" className="gap-1.5" onClick={onCreateAppointment}>
          <Plus className="size-4" />
          Schedule appointment
        </Button>
      )}
    </div>
  );
}
