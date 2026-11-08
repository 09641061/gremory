"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/contexts/shared/interfaces/components/ui/popover";
import { Calendar } from "@/contexts/shared/interfaces/components/ui/calendar";
import { useSchedulingTranslations } from "../../i18n";
import type { SchedulingMemberViewModel } from "../../../application/model/scheduling-page-data.view-model";

interface CalendarToolbarProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
  onScheduleAppointment: () => void;
  canCreateAppointment: boolean;
  timeZone: string;
  viewMode?: "day" | "week" | "month";
  onViewModeChange?: (mode: "day" | "week" | "month") => void;
  members?: SchedulingMemberViewModel[];
  selectedEmployeeId?: string | null;
  onEmployeeChange?: (employeeId: string | null) => void;
}

export function CalendarToolbar({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
  onDateSelect,
  onScheduleAppointment,
  canCreateAppointment,
  timeZone,
  viewMode = "day",
  onViewModeChange,
  members = [],
  selectedEmployeeId = null,
  onEmployeeChange,
}: CalendarToolbarProps) {
  const { t, locale } = useSchedulingTranslations();
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const rawFormatted = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(currentDate);

  const formattedDate = rawFormatted.charAt(0).toUpperCase() + rawFormatted.slice(1);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3">
      {/* Left group */}
      <div className="flex flex-wrap items-center gap-3">
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-1.5 text-lg sm:text-xl font-bold tracking-tight text-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 w-full sm:w-[290px] shrink-0 text-left justify-start"
              />
            }
          >
            <span className="truncate">{formattedDate}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50 transition-transform" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => {
                if (date) {
                  onDateSelect(date);
                  setIsPickerOpen(false);
                }
              }}
            />
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={onToday} className="h-8 px-2.5 text-xs font-medium">
          {t.calendar.today}
        </Button>

        <div className="flex items-center rounded-md border border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevDay}
            aria-label={t.calendar.prevDay}
            title={t.calendar.prevDay}
            className="h-8 w-8 rounded-none rounded-l-md border-r border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextDay}
            aria-label={t.calendar.nextDay}
            title={t.calendar.nextDay}
            className="h-8 w-8 rounded-none rounded-r-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* View mode segmented control */}
        <div className="inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground text-xs font-medium">
          <button
            type="button"
            onClick={() => onViewModeChange?.("day")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === "day"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "hover:text-foreground"
            }`}
          >
            {t.calendar.day}
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.("week")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === "week"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "hover:text-foreground"
            }`}
          >
            {t.calendar.week}
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.("month")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
              viewMode === "month"
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "hover:text-foreground"
            }`}
          >
            {t.calendar.month}
          </button>
        </div>
      </div>

      {/* Right group */}
      <div className="flex items-center gap-2">
        {(viewMode === "week" || viewMode === "month") && (
          <select
            value={selectedEmployeeId ?? ""}
            onChange={(e) => onEmployeeChange?.(e.target.value ? e.target.value : null)}
            className="h-8 rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm outline-none focus:ring-2 focus:ring-ring"
            aria-label={t.calendar.allEmployees}
          >
            <option value="">{t.calendar.allEmployees}</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name}
              </option>
            ))}
          </select>
        )}

        {canCreateAppointment && (
          <Button
            onClick={onScheduleAppointment}
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3 text-xs font-medium shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t.calendar.newAppointment}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
