"use client";

import { Appointment } from "../../domain/model/entities/appointment";
import { AppointmentBlock } from "./appointment-block";

interface WeeklyCalendarGridProps {
  appointments: Appointment[];
  weekDays: Date[];
  hours: number[];
  isPending: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
}

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
        <div key={hour} className="h-20 border-b border-border flex relative">
          <div className="w-16 border-r border-border shrink-0 flex items-start justify-center pt-2 text-[10px] font-semibold text-muted-foreground">
            {formatHour(hour)}
          </div>

          <div className="flex-1 grid grid-cols-7 relative">
            {weekDays.map((day, dayIdx) => {
              const dayAppts = appointments.filter((appt) => {
                const apptStart = new Date(appt.startsAt);
                return apptStart.toDateString() === day.toDateString() && apptStart.getHours() === hour;
              });

              return (
                <div
                  key={dayIdx}
                  className={`relative p-1 h-full ${isToday(day) ? "bg-primary/5" : ""}`}
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
