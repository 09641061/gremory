"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface WeeklyCalendarHeaderProps {
  formattedMonthYear: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onCreateAppointment: () => void;
}

export function WeeklyCalendarHeader({
  formattedMonthYear,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onCreateAppointment,
}: WeeklyCalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-foreground capitalize">{formattedMonthYear}</h2>
        <div className="flex items-center border border-border rounded-lg bg-card p-0.5">
          <Button variant="ghost" size="icon-xs" onClick={onPreviousWeek} title="Previous Week">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onNextWeek} title="Next Week">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Today
        </Button>
      </div>

      <Button size="sm" className="gap-1.5" onClick={onCreateAppointment}>
        <Plus className="size-4" />
        Schedule Appointment
      </Button>
    </div>
  );
}
