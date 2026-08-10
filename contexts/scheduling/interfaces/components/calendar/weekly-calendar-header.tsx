import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "@/contexts/business/interfaces/components/use-selector-menu";
import { cn } from "@/lib/utils";

interface WeeklyCalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onCreateAppointment: () => void;
  canCreateAppointment: boolean;
}

export function WeeklyCalendarHeader({
  currentDate,
  onDateChange,
  onPreviousWeek,
  onNextWeek,
  onToday,
  onCreateAppointment,
  canCreateAppointment,
}: WeeklyCalendarHeaderProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useSelectorMenu(isPickerOpen, setIsPickerOpen, selectorRef);

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const currentYear = currentDate.getFullYear();
  const currentMonthIdx = currentDate.getMonth();

  const [tempYear, setTempYear] = useState(() => currentYear);
  const [prevIsPickerOpen, setPrevIsPickerOpen] = useState(isPickerOpen);
  const [prevYear, setPrevYear] = useState(currentYear);

  if (isPickerOpen !== prevIsPickerOpen || currentYear !== prevYear) {
    setPrevIsPickerOpen(isPickerOpen);
    setPrevYear(currentYear);
    if (isPickerOpen || currentYear !== prevYear) {
      setTempYear(currentYear);
    }
  }

  const handleMonthSelect = (monthIdx: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setFullYear(tempYear);
    nextDate.setMonth(monthIdx);
    onDateChange(nextDate);
    setIsPickerOpen(false);
  };

  const handleYearChange = (amount: number) => {
    setTempYear((year) => year + amount);
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        {/* Month/Year selector with fixed width to prevent week buttons from shifting */}
        <div ref={selectorRef} className="relative w-44 shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
            className="w-full justify-start text-xl font-semibold text-foreground px-2 h-10 hover:bg-muted/50 rounded-xl"
          >
            <span className="capitalize text-left truncate">{formattedMonthYear}</span>
          </Button>

          {isPickerOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-3 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleYearChange(-1)}
                  aria-label="Previous year"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="text-sm font-semibold text-foreground">{tempYear}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleYearChange(1)}
                  aria-label="Next year"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {months.map((m, idx) => {
                  const isSelected = idx === currentMonthIdx && tempYear === currentYear;
                  return (
                    <Button
                      key={m}
                      type="button"
                      variant={isSelected ? "default" : "ghost"}
                      onClick={() => handleMonthSelect(idx)}
                      className={cn(
                        "h-9 text-xs rounded-xl font-medium",
                        !isSelected && "hover:bg-muted text-foreground"
                      )}
                    >
                      {m}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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

      {canCreateAppointment && (
        <Button size="sm" className="gap-1.5" onClick={onCreateAppointment}>
          <Plus className="size-4" />
          Schedule Appointment
        </Button>
      )}
    </div>
  );
}
