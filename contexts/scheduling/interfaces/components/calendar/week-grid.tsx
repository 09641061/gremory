"use client";

import {
  SchedulingCustomerViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { Appointment } from "../../../domain/model/entities/appointment";
import { AppointmentBlock } from "./appointment-block";
import {
  addCalendarDays,
  getTimeZoneParts,
  toTimeZoneDayKey,
} from "../scheduling-timezone.utils";

interface WeekGridProps {
  currentDate: Date;
  appointments: Appointment[];
  timeZone: string;
  now: number | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  customers?: SchedulingCustomerViewModel[];
  services?: SchedulingServiceViewModel[];
  selectedAppointmentId?: string | null;
}

export function WeekGrid({
  currentDate,
  appointments,
  timeZone,
  now,
  onAppointmentClick,
  onTimeSlotClick,
  customers = [],
  services = [],
  selectedAppointmentId = null,
}: WeekGridProps) {
  // 7 AM to 9 PM (7:00 to 21:00)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const dayOfWeek = currentDate.getUTCDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = addCalendarDays(currentDate, mondayOffset);
  const days = Array.from({ length: 7 }, (_, i) => addCalendarDays(monday, i));

  const nowKey = now !== null ? toTimeZoneDayKey(new Date(now), timeZone) : null;
  const nowParts = now !== null ? getTimeZoneParts(new Date(now), timeZone) : null;
  const currentHour = nowParts?.hour ?? -1;
  const currentMinute = nowParts?.minute ?? 0;
  const currentMinutePercent = Math.min(Math.max((currentMinute / 60) * 100, 0), 100);

  const getAppointmentsForDayAtHour = (day: Date, hour: number) => {
    const dayKey = toTimeZoneDayKey(day, timeZone);
    return appointments.filter((apt) => {
      const aptKey = toTimeZoneDayKey(new Date(apt.startsAt), timeZone);
      if (aptKey !== dayKey) return false;
      const aptParts = getTimeZoneParts(new Date(apt.startsAt), timeZone);
      return aptParts.hour === hour;
    });
  };

  return (
    <div className="flex min-h-0 flex-1 bg-background rounded-b-xl border border-t-0 w-full">
      <div className="flex w-full h-full flex-col min-w-0">
        {hours.map((hour) => {
          return (
            <div key={hour} className="relative flex border-b last:border-b-0 min-h-[80px]">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 border-r py-2 pr-2 text-right relative bg-muted/5">
                <span className="text-xs text-muted-foreground font-medium">
                  {`${hour}:00`}
                </span>
                {nowParts && hour === currentHour && (
                  <div
                    className="absolute left-0 right-1 z-20 flex items-center justify-end pointer-events-none"
                    style={{ top: `calc(${currentMinutePercent}% - 8px)` }}
                  >
                    <span className="rounded bg-red-500 px-1 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      {String(currentHour).padStart(2, "0")}:{String(currentMinute).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>

              {/* 7 Days cells */}
              <div className="relative grid flex-1 grid-cols-7 divide-x">
                {days.map((day) => {
                  const dayKey = toTimeZoneDayKey(day, timeZone);
                  const isCurrentDay = dayKey === nowKey;
                  const isCurrentHourRow = isCurrentDay && hour === currentHour;

                  return (
                    <div
                      key={dayKey}
                      className="relative p-1 min-w-0 transition-colors hover:bg-muted/10 cursor-pointer"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          onTimeSlotClick?.(day, hour);
                        }
                      }}
                    >
                      {isCurrentHourRow && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                          style={{ top: `${currentMinutePercent}%` }}
                        >
                          <div className="size-2 -ml-1 rounded-full bg-red-500 shadow-xs" />
                          <div className="h-0.5 flex-1 bg-red-500 shadow-xs" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1 w-full relative z-10 pointer-events-none">
                        {getAppointmentsForDayAtHour(day, hour).map((apt) => {
                          const customer = customers.find((c) => c.id === apt.customerId);
                          const service = services.find((s) => s.id === apt.serviceId);

                          return (
                            <div key={apt.id} className="w-full pointer-events-auto">
                              <AppointmentBlock
                                appointment={apt}
                                now={now}
                                timeZone={timeZone}
                                onClick={() => onAppointmentClick(apt)}
                                customerName={customer?.name}
                                serviceName={service?.name}
                                isSelected={selectedAppointmentId === apt.id}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
