import {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { Appointment } from "../../../domain/model/entities/appointment";
import { AppointmentBlock } from "./appointment-block";
import { cn } from "@/lib/utils";
import { getTimeZoneParts, toTimeZoneDayKey } from "../scheduling-timezone.utils";

interface DailyStaffGridProps {
  currentDate: Date;
  visibleEmployees: SchedulingMemberViewModel[];
  appointments: Appointment[];
  timeZone: string;
  maxColumns: number;
  now: number | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (employeeId: string, hour?: number) => void;
  customers?: SchedulingCustomerViewModel[];
  services?: SchedulingServiceViewModel[];
  selectedAppointmentId?: string | null;
}

export function DailyStaffGrid({
  currentDate,
  visibleEmployees,
  appointments,
  timeZone,
  maxColumns,
  now,
  onAppointmentClick,
  onTimeSlotClick,
  customers = [],
  services = [],
  selectedAppointmentId = null,
}: DailyStaffGridProps) {
  // 7 AM to 9 PM (7:00 to 21:00)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  const isToday = (() => {
    if (now === null) return false;
    const currentKey = toTimeZoneDayKey(currentDate, timeZone);
    const nowKey = toTimeZoneDayKey(new Date(now), timeZone);
    return currentKey === nowKey;
  })();

  const nowParts = now !== null ? getTimeZoneParts(new Date(now), timeZone) : null;
  const currentHour = nowParts?.hour ?? -1;
  const currentMinute = nowParts?.minute ?? 0;
  const currentMinutePercent = Math.min(Math.max((currentMinute / 60) * 100, 0), 100);

  const getAppointmentsForEmployeeAtHour = (employeeId: string, hour: number) => {
    return appointments.filter((apt) => {
      if (apt.employeeId !== employeeId) return false;
      const starts = new Date(apt.startsAt);
      
      const timeString = starts.toLocaleTimeString("en-US", {
        timeZone,
        hour: "numeric",
        hour12: false,
      });
      return parseInt(timeString, 10) === hour &&
             starts.getDate() === currentDate.getDate() &&
             starts.getMonth() === currentDate.getMonth() &&
             starts.getFullYear() === currentDate.getFullYear();
    });
  };

  const gridColsClass = 
    visibleEmployees.length === 1 
      ? "grid-cols-[350px_1fr]" 
      : visibleEmployees.length === 2 
        ? "grid-cols-[300px_300px_1fr]" 
        : "auto-cols-fr grid-flow-col";

  return (
    <div className="flex min-h-0 flex-1 bg-background rounded-b-xl border border-t-0 w-full">
      <div className="flex w-full h-full flex-col min-w-0">
        {hours.map((hour) => {
          const isCurrentHourRow = isToday && hour === currentHour;

          return (
            <div key={hour} className="relative flex border-b last:border-b-0 min-h-[80px]">
              {/* Time label */}
              <div className="w-16 flex-shrink-0 border-r py-2 pr-2 text-right relative bg-muted/5">
                <span className="text-xs text-muted-foreground font-medium">
                  {`${hour}:00`}
                </span>
                {isCurrentHourRow && (
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
              
              {/* Staff cells */}
              <div className={cn("relative flex-1 grid divide-x", gridColsClass)}>
                {isCurrentHourRow && (
                  <div
                    className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                    style={{ top: `${currentMinutePercent}%` }}
                  >
                    <div className="size-2 -ml-1 rounded-full bg-red-500 shadow-xs" />
                    <div className="h-0.5 flex-1 bg-red-500 shadow-xs" />
                  </div>
                )}

                {visibleEmployees.map((employee) => (
                  <div 
                    key={employee.userId} 
                    className="relative p-1 min-w-0 transition-colors hover:bg-muted/10 cursor-pointer"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        onTimeSlotClick(employee.userId, hour);
                      }
                    }}
                  >
                    <div className="flex flex-col gap-1 w-full relative z-10 pointer-events-none">
                      {getAppointmentsForEmployeeAtHour(employee.userId, hour).map((apt) => {
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
                ))}
                {visibleEmployees.length < 3 ? (
                  <div className="min-w-0 flex-1 bg-muted/5" />
                ) : (
                  Array.from({ length: Math.max(0, maxColumns - visibleEmployees.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-w-0 flex-1 bg-muted/5" />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
