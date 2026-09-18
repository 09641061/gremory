import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/contexts/shared/interfaces/components/ui/popover";
import { Calendar } from "@/contexts/shared/interfaces/components/ui/calendar";

import { useI18n } from "@/contexts/shared/interfaces/i18n";
import { useSchedulingTranslations } from "../../i18n";

interface CalendarToolbarProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onDateSelect: (date: Date) => void;
  onScheduleAppointment: () => void;
  canCreateAppointment: boolean;
  timeZone: string;
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
}: CalendarToolbarProps) {
  const { locale } = useI18n();
  const { t } = useSchedulingTranslations();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between py-4 px-2">
      <div className="flex items-center gap-4">
        <Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                className="w-[320px] justify-start text-xl font-normal tracking-tight h-auto px-2 py-1 -ml-2"
              />
            }
          >
            {formatter.format(currentDate)}
            <ChevronDown className="ml-2 h-5 w-5 opacity-50" />
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

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onToday}>
            {t.calendar.today}
          </Button>
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevDay}
              aria-label={t.calendar.prevDay}
              title={t.calendar.prevDay}
              className="h-8 w-8 rounded-none rounded-l-md border-r"
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
        </div>
      </div>
      
      {canCreateAppointment && (
        <Button onClick={onScheduleAppointment}>
          {t.calendar.scheduleAppointment}
        </Button>
      )}
    </div>
  );
}
