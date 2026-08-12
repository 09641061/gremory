"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailModal } from "../appointment-detail/appointment-detail-modal";
import { WeeklyCalendarDaysHeader } from "./weekly-calendar-days-header";
import { WeeklyCalendarGrid } from "./weekly-calendar-grid";
import { WeeklyCalendarToolbar } from "./weekly-calendar-toolbar";
import {
  addCalendarDays,
  calendarDateToZonedIso,
  getCalendarAnchorDate,
  getCalendarWeekRange,
  toTimeZoneDayKey,
} from "../scheduling-timezone.utils";
import { useNow } from "../use-now";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";

const FIRST_HOUR = 7;
const HOUR_COUNT = 15;
const GRID_MIN_WIDTH = 700;
const HOURS = Array.from({ length: HOUR_COUNT }, (_, index) => FIRST_HOUR + index);

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
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => getCalendarAnchorDate(timeZone));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);
  const now = useNow();
  const todayKey = now === null ? null : toTimeZoneDayKey(new Date(now), timeZone);

  useEffect(() => {
    setCurrentDate(getCalendarAnchorDate(timeZone));
  }, [timeZone]);

  const { sunday: weekStart, saturday: weekEnd } = useMemo(
    () => getCalendarWeekRange(currentDate),
    [currentDate]
  );

  const weekDays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => addCalendarDays(weekStart, index)),
    [weekStart]
  );

  const fetchAppointments = useCallback(() => {
    const requestId = ++requestIdRef.current;

    startTransition(async () => {
      const result = await listAppointmentsAction(
        calendarDateToZonedIso(weekStart, timeZone, false),
        calendarDateToZonedIso(weekEnd, timeZone, true),
        establishmentId
      );
      if (requestId === requestIdRef.current) {
        setAppointments(result.content);
      }
    });
  }, [weekStart, weekEnd, establishmentId, timeZone, startTransition]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const shiftWeek = (direction: -1 | 1) => {
    setCurrentDate((current) => addCalendarDays(current, direction * 7));
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
        onToday={() => setCurrentDate(getCalendarAnchorDate(timeZone))}
        onCreateAppointment={() => router.push("/schedule/new")}
        canCreateAppointment={canCreateAppointment}
        timeZone={timeZone}
      />

      <div className="flex-1 overflow-auto rounded-xl border border-border bg-card shadow-sm">
        <div style={{ minWidth: GRID_MIN_WIDTH }}>
          <WeeklyCalendarDaysHeader weekDays={weekDays} todayKey={todayKey} timeZone={timeZone} />
          <WeeklyCalendarGrid
            appointments={appointments}
            weekDays={weekDays}
            hours={HOURS}
            isPending={isPending}
            todayKey={todayKey}
            now={now}
            timeZone={timeZone}
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
          timeZone={timeZone}
        />
      )}
    </div>
  );
}
