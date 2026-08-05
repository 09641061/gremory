"use client";

import { useMemo } from "react";
import { Appointment } from "../../../domain/model/entities/appointment";
import { AppointmentBlock } from "./appointment-block";

interface WeeklyCalendarGridProps {
  appointments: Appointment[];
  weekDays: Date[];
  hours: number[];
  isPending: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
}

const BASE_ROW_HEIGHT = 80;
const CARD_HEIGHT = 72;
const ROW_PADDING = 16;

function formatHour(hour: number) {
  if (hour > 12) return `${hour - 12} PM`;
  if (hour === 12) return "12 PM";
  return `${hour} AM`;
}

function isToday(date: Date) {
  return date.toDateString() === new Date().toDateString();
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="h-10 w-full animate-pulse bg-muted rounded" />
      <div className="h-20 w-full animate-pulse bg-muted rounded" />
      <div className="h-20 w-full animate-pulse bg-muted rounded" />
    </div>
  );
}

export function WeeklyCalendarGrid({
  appointments,
  weekDays,
  hours,
  isPending,
  onAppointmentClick,
}: WeeklyCalendarGridProps) {
  const appointmentsByDayHour = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments.forEach((appointment) => {
      const starts = new Date(appointment.startsAt);
      const key = `${starts.toDateString()}-${starts.getHours()}`;
      const current = map.get(key) ?? [];
      current.push(appointment);
      map.set(key, current);
    });
    return map;
  }, [appointments]);

  if (isPending) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="relative select-none min-w-[700px]">
      <div className="absolute inset-0 grid grid-cols-[64px_repeat(7,1fr)] pointer-events-none">
        <div className="border-r border-border h-full" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="border-r border-border last:border-r-0 h-full" />
        ))}
      </div>

      {hours.map((hour) => (
        <div
          key={hour}
          className="border-b border-border flex relative"
          style={{
            minHeight: BASE_ROW_HEIGHT,
          }}
        >
          <div className="w-16 border-r border-border shrink-0 flex items-start justify-center pt-2 text-[10px] font-semibold text-muted-foreground">
            {formatHour(hour)}
          </div>

          <div className="flex-1 grid grid-cols-7 relative">
            {weekDays.map((day, dayIdx) => {
              const dayAppts = appointmentsByDayHour.get(`${day.toDateString()}-${hour}`) ?? [];
              const rowHeight = Math.max(
                BASE_ROW_HEIGHT,
                dayAppts.length > 0 ? dayAppts.length * CARD_HEIGHT + ROW_PADDING : BASE_ROW_HEIGHT
              );

              return (
                <div
                  key={dayIdx}
                  className={`relative p-1 h-full flex flex-col gap-2 ${isToday(day) ? "bg-primary/5" : ""}`}
                  style={{
                    minHeight: rowHeight,
                  }}
                >
                  {dayAppts.map((appt) => (
                    <AppointmentBlock
                      key={appt.id}
                      appointment={appt}
                      onClick={() => onAppointmentClick(appt)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
