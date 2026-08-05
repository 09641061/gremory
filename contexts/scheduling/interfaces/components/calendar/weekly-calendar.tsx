"use client";

import { useState, useTransition, useEffect, useCallback, useMemo, useRef } from "react";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailModal } from "../appointment-detail/appointment-detail-modal";
import { AppointmentFormModal } from "../appointment-form/appointment-form-modal";
import { WeeklyCalendarGrid } from "./weekly-calendar-grid";
import { WeeklyCalendarHeader } from "./weekly-calendar-header";
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
}

function getWeekRange(date: Date) {
  const current = new Date(date);
  const first = current.getDate() - current.getDay();
  const sunday = new Date(current.setDate(first));
  sunday.setHours(0, 0, 0, 0);

  const saturday = new Date(sunday);
  saturday.setDate(sunday.getDate() + 6);
  saturday.setHours(23, 59, 59, 999);

  return { sunday, saturday };
}

export function WeeklyCalendar({
  establishmentId,
  services,
  members,
  customers,
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const requestIdRef = useRef(0);

  const { sunday, saturday } = useMemo(() => getWeekRange(currentDate), [currentDate]);

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d;
      }),
    [sunday]
  );

  const hours = useMemo(() => Array.from({ length: 15 }, (_, i) => 7 + i), []);

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const fetchAppointments = useCallback(() => {
    const reqId = ++requestIdRef.current;
    
    // Función local para convertir fecha a ISO con offset
    const toLocalISOString = (date: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      const tzo = -date.getTimezoneOffset();
      const dif = tzo >= 0 ? "+" : "-";
      return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate()) +
        "T" +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        ":" +
        pad(date.getSeconds()) +
        dif +
        pad(Math.floor(Math.abs(tzo) / 60)) +
        ":" +
        pad(Math.abs(tzo) % 60)
      );
    };

    startTransition(async () => {
      const fromStr = toLocalISOString(sunday);
      const toStr = toLocalISOString(saturday);
      const res = await listAppointmentsAction(fromStr, toStr, establishmentId);
      if (reqId === requestIdRef.current) {
        setAppointments(res.content);
      }
    });
  }, [sunday, saturday, establishmentId, startTransition]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
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
        formattedMonthYear={formattedMonthYear}
        onPreviousWeek={() => navigateWeek("prev")}
        onNextWeek={() => navigateWeek("next")}
        onToday={navigateToday}
        onCreateAppointment={() => setIsFormOpen(true)}
      />

      <div className="flex-1 border border-border rounded-xl bg-card shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto relative">
          <div className="sticky top-0 z-10 grid grid-cols-[64px_repeat(7,1fr)] border-b border-border bg-card">
            <div className="flex items-center justify-center p-3 border-r border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Time
              </span>
            </div>
            {weekDays.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`p-3 flex flex-col items-center justify-center border-r border-border last:border-r-0 ${
                    isToday ? "bg-primary/5" : ""
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold uppercase ${
                      isToday ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-xl font-bold leading-none mt-1 ${
                      isToday
                        ? "bg-primary text-primary-foreground size-8 rounded-full flex items-center justify-center"
                        : "text-foreground"
                    }`}
                  >
                    {day.getDate()}
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
        />
      )}
    </div>
  );
}
