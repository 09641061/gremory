import { SchedulingMemberViewModel } from "../../../application/model/scheduling-page-data.view-model";
import { Appointment } from "../../../domain/model/entities/appointment";
import { AppointmentBlock } from "./appointment-block";
import { cn } from "@/lib/utils";

interface DailyStaffGridProps {
  currentDate: Date;
  visibleEmployees: SchedulingMemberViewModel[];
  appointments: Appointment[];
  timeZone: string;
  maxColumns: number;
  now: number | null;
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (employeeId: string) => void;
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
}: DailyStaffGridProps) {
  // 7 AM to 9 PM
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

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

  let maxWidthClass = "w-full";
  if (visibleEmployees.length === 1) maxWidthClass = "max-w-[414px]";
  else if (visibleEmployees.length === 2) maxWidthClass = "max-w-[764px]";

  const gridColsClass = 
    visibleEmployees.length === 1 
      ? "grid-cols-[350px_1fr]" 
      : visibleEmployees.length === 2 
        ? "grid-cols-[300px_300px_1fr]" 
        : "auto-cols-fr grid-flow-col";

  return (
    <div className={cn("flex flex-1 overflow-y-scroll min-h-0 bg-background rounded-b-xl border border-t-0 [scrollbar-gutter:stable]", maxWidthClass)}>
      <div className="flex w-full h-full flex-col min-w-0">
        {hours.map((hour) => (
          <div key={hour} className="flex border-b last:border-b-0 min-h-[80px]">
            {/* Time label */}
            <div className="w-16 flex-shrink-0 border-r py-2 pr-2 text-right relative bg-muted/5">
              <span className="text-xs text-muted-foreground font-medium sticky top-2">
                {hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </span>
            </div>
            
            {/* Staff cells */}
            <div className={cn("flex-1 grid divide-x", gridColsClass)}>
              {visibleEmployees.map((employee) => (
                <div 
                  key={employee.userId} 
                  className="relative p-1 min-w-0 transition-colors hover:bg-muted/10 cursor-pointer"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      onTimeSlotClick(employee.userId);
                    }
                  }}
                >
                  <div className="flex flex-col gap-1 w-full relative z-10 pointer-events-none">
                    {getAppointmentsForEmployeeAtHour(employee.userId, hour).map((apt) => (
                      <div key={apt.id} className="w-full pointer-events-auto">
                        <AppointmentBlock
                          appointment={apt}
                          now={now}
                          timeZone={timeZone}
                          onClick={() => onAppointmentClick(apt)}
                        />
                      </div>
                    ))}
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
        ))}
      </div>
    </div>
  );
}
