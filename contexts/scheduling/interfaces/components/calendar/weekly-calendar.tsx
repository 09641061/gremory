"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailModal } from "../appointment-detail/appointment-detail-modal";
import { WeeklyCalendarDaysHeader } from "./weekly-calendar-days-header";
import { WeeklyCalendarGrid } from "./weekly-calendar-grid";
import { WeeklyCalendarToolbar } from "./weekly-calendar-toolbar";
import { getWeekRange, toDayKey, toLocalISOString } from "../scheduling-datetime";
import { useNow } from "../use-now";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";

const FIRST_HOUR = 7;
const HOUR_COUNT = 15;
/** Below this the seven day columns stop being readable, so the grid scrolls. */
const GRID_MIN_WIDTH = 700;

interface WeeklyCalendarProps {
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  canCreateAppointment: boolean;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
}

const HOURS = Array.from({ length: HOUR_COUNT }, (_, index) => FIRST_HOUR + index);

export function WeeklyCalendar({
  establishmentId,
  services,
  members,
  customers,
  canCreateAppointment,
  canUpdateAppointment,
  canDeleteAppointment,
}: WeeklyCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isPending, startTransition] = useTransition();

  // Discards responses from superseded week requests.
  const requestIdRef = useRef(0);
  const now = useNow();
  const todayKey = now === null ? null : toDayKey(new Date(now));

  const { start: weekStart, end: weekEnd } = useMemo(
    () => getWeekRange(currentDate),
    [currentDate]
  );

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + index);
        return day;
      }),
    [weekStart]
  );

  const fetchAppointments = useCallback(() => {
    const requestId = ++requestIdRef.current;

    startTransition(async () => {
      const result = await listAppointmentsAction(
        toLocalISOString(weekStart),
        toLocalISOString(weekEnd),
        establishmentId
      );
      if (requestId === requestIdRef.current) {
        setAppointments(result.content);
      }
    });
  }, [weekStart, weekEnd, establishmentId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const shiftWeek = (direction: -1 | 1) => {
    setCurrentDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const handleUpdate = (updated: Appointment) => {
    setAppointments((current) =>
      current.map((appointment) => (appointment.id === updated.id ? updated : appointment))
    );
    setSelectedAppointment(updated);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full flex-col bg-background text-foreground">
      <WeeklyCalendarToolbar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onPreviousWeek={() => shiftWeek(-1)}
        onNextWeek={() => shiftWeek(1)}
        onToday={() => setCurrentDate(new Date())}
        onCreateAppointment={() => router.push("/schedule/new")}
        canCreateAppointment={canCreateAppointment}
      />

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
        {/* Header and grid share this track so they scroll horizontally together. */}
        <div style={{ minWidth: GRID_MIN_WIDTH }}>
          <WeeklyCalendarDaysHeader weekDays={weekDays} todayKey={todayKey} />
          <WeeklyCalendarGrid
            appointments={appointments}
            weekDays={weekDays}
            hours={HOURS}
            isPending={isPending}
            todayKey={todayKey}
            now={now}
            onAppointmentClick={setSelectedAppointment}
          />
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen
          onOpenChange={(open) => {
            if (!open) setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          services={services}
          members={members}
          customers={customers}
          onUpdate={handleUpdate}
          onDeleteSuccess={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
          canUpdateAppointment={canUpdateAppointment}
          canDeleteAppointment={canDeleteAppointment}
        />
      )}
    </div>
  );
}
