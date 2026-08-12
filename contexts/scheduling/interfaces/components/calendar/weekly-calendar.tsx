"use client";

import { useState, useTransition, useEffect, useCallback, useMemo, useRef } from "react";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailModal } from "../appointment-detail/appointment-detail-modal";
import { AppointmentFormModal } from "../appointment-form/appointment-form-modal";
import { WeeklyCalendarGrid } from "./weekly-calendar-grid";
import { WeeklyCalendarHeader } from "./weekly-calendar-header";
import {
  addCalendarDays,
  calendarDateToZonedIso,
  formatCalendarWeekday,
  getCalendarAnchorDate,
  getCalendarWeekRange,
  isSameCalendarDate,
} from "../scheduling-timezone.utils";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";

interface WeeklyCalendarProps {
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  canCreateAppointment: boolean;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
  timeZone: string;
}

export function WeeklyCalendar({
  establishmentId,
  services,
  members,
  customers,
  canCreateAppointment,
  canUpdateAppointment,
  canDeleteAppointment,
  timeZone,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => getCalendarAnchorDate(timeZone));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const requestIdRef = useRef(0);

  useEffect(() => {
    setCurrentDate(getCalendarAnchorDate(timeZone));
  }, [timeZone]);

  const { sunday, saturday } = useMemo(() => getCalendarWeekRange(currentDate), [currentDate]);
  const todayDate = useMemo(() => getCalendarAnchorDate(timeZone), [timeZone]);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addCalendarDays(sunday, i)),
    [sunday]
  );

  const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 7 + i), []);

  const fetchAppointments = useCallback(() => {
    const reqId = ++requestIdRef.current;

    startTransition(async () => {
      const fromStr = calendarDateToZonedIso(sunday, timeZone, false);
      const toStr = calendarDateToZonedIso(saturday, timeZone, true);
      const res = await listAppointmentsAction(fromStr, toStr, establishmentId);
      if (reqId === requestIdRef.current) {
        setAppointments(res.content);
      }
    });
  }, [sunday, saturday, timeZone, establishmentId, startTransition]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentDate((date) => addCalendarDays(date, direction === "prev" ? -7 : 7));
  };

  const navigateToday = () => {
    setCurrentDate(getCalendarAnchorDate(timeZone));
  };

  const handleOpenDetail = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setIsDetailOpen(true);
  };

  const handleUpdate = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelectedAppointment(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full text-foreground bg-background">
      <WeeklyCalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onPreviousWeek={() => navigateWeek("prev")}
        onNextWeek={() => navigateWeek("next")}
        onToday={navigateToday}
        onCreateAppointment={() => setIsFormOpen(true)}
        canCreateAppointment={canCreateAppointment}
      />

      <div className="flex-1 border border-border rounded-xl bg-card shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto relative">
          <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-card">
            <div className="flex items-center justify-center p-3 border-r border-border">
              <span className="text-[10px] font-bold text-muted-foreground tracking-wider">
                Time
              </span>
            </div>
            {weekDays.map((day, idx) => {
              const isToday = isSameCalendarDate(day, todayDate);
              return (
                <div
                  key={idx}
                  className={`p-3 flex flex-col items-center justify-center border-r border-border last:border-r-0 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {formatCalendarWeekday(day)}
                  </span>
                  <span
                    className={`text-xl font-bold leading-none mt-1 ${
                      isToday
                        ? "bg-primary text-primary-foreground size-8 rounded-full flex items-center justify-center"
                        : "text-foreground"
                    }`}
                  >
                    {day.getUTCDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <WeeklyCalendarGrid
            appointments={appointments}
            weekDays={weekDays}
            hours={hours}
            isPending={isPending}
            timeZone={timeZone}
            todayDate={todayDate}
            onAppointmentClick={handleOpenDetail}
          />
        </div>
      </div>

      {isDetailOpen && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          appointment={selectedAppointment}
          services={services}
          members={members}
          customers={customers}
          onUpdate={handleUpdate}
          onDeleteSuccess={fetchAppointments}
          canUpdateAppointment={canUpdateAppointment}
          canDeleteAppointment={canDeleteAppointment}
          timeZone={timeZone}
        />
      )}

      {isFormOpen && (
        <AppointmentFormModal
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          establishmentId={establishmentId}
          services={services}
          members={members}
          customers={customers}
          onSuccess={fetchAppointments}
          timeZone={timeZone}
        />
      )}
    </div>
  );
}
