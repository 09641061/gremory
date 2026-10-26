"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailPanel } from "../appointment-detail/appointment-detail-panel";
import {
  addCalendarDays,
  calendarDateToZonedIso,
  getCalendarAnchorDate,
} from "../scheduling-timezone.utils";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { CalendarToolbar } from "./calendar-toolbar";
import { StaffColumnsHeader } from "./staff-columns-header";
import { DailyStaffGrid } from "./daily-staff-grid";
import { WeekColumnsHeader } from "./week-columns-header";
import { WeekGrid } from "./week-grid";
import { MonthColumnsHeader } from "./month-columns-header";
import { MonthGrid } from "./month-grid";
import { NoEmployeesEmptyState } from "./no-employees-empty-state";
import { useNow } from "../use-now";

interface DailyStaffCalendarProps {
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  canCreateAppointment: boolean;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
  timeZone: string;
  currency?: "USD" | "PEN";
}

export function DailyStaffCalendar({
  establishmentId,
  services,
  members,
  customers,
  canCreateAppointment,
  canUpdateAppointment,
  canDeleteAppointment,
  timeZone,
  currency = "PEN",
}: DailyStaffCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => getCalendarAnchorDate(timeZone));
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [, startTransition] = useTransition();
  const [startIndex, setStartIndex] = useState(0);
  const maxColumns = 6;
  const requestIdRef = useRef(0);
  const now = useNow();

  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      const dayOfWeek = currentDate.getUTCDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = addCalendarDays(currentDate, mondayOffset);
      const sunday = addCalendarDays(monday, 6);
      return {
        from: calendarDateToZonedIso(monday, timeZone, false),
        to: calendarDateToZonedIso(sunday, timeZone, true),
      };
    }
    if (viewMode === "month") {
      const firstDay = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1, 12, 0, 0, 0));
      const lastDay = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth() + 1, 0, 12, 0, 0, 0));
      const startDayOfWeek = firstDay.getUTCDay();
      const startOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
      const gridStart = addCalendarDays(firstDay, startOffset);
      const endDayOfWeek = lastDay.getUTCDay();
      const endOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
      const gridEnd = addCalendarDays(lastDay, endOffset);
      return {
        from: calendarDateToZonedIso(gridStart, timeZone, false),
        to: calendarDateToZonedIso(gridEnd, timeZone, true),
      };
    }
    // "day" mode
    return {
      from: calendarDateToZonedIso(currentDate, timeZone, false),
      to: calendarDateToZonedIso(currentDate, timeZone, true),
    };
  }, [currentDate, timeZone, viewMode]);

  const fetchAppointments = useCallback(() => {
    const requestId = ++requestIdRef.current;

    startTransition(async () => {
      const result = await listAppointmentsAction(
        dateRange.from,
        dateRange.to,
        establishmentId
      );
      if (requestId === requestIdRef.current) {
        if ("content" in result) {
          setAppointments(result.content);
          setLoadError(null);
        } else {
          setAppointments([]);
          setLoadError(result.message);
        }
      }
    });
  }, [dateRange, establishmentId, startTransition]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const shiftDay = (direction: -1 | 1) => {
    if (viewMode === "week") {
      setCurrentDate((current) => addCalendarDays(current, direction * 7));
    } else if (viewMode === "month") {
      setCurrentDate(
        (current) =>
          new Date(Date.UTC(current.getUTCFullYear(), current.getUTCMonth() + direction, 1, 12, 0, 0, 0))
      );
    } else {
      setCurrentDate((current) => addCalendarDays(current, direction));
    }
  };

  const handleUpdate = (updated: Appointment) => {
    setAppointments((current) =>
      current.map((appointment) => (appointment.id === updated.id ? updated : appointment))
    );
    setSelectedAppointment(updated);
  };

  const visibleEmployees = useMemo(() => {
    return members.slice(startIndex, startIndex + maxColumns);
  }, [members, startIndex]);

  const filteredAppointments = useMemo(() => {
    if (!selectedEmployeeId) return appointments;
    return appointments.filter((apt) => apt.employeeId === selectedEmployeeId);
  }, [appointments, selectedEmployeeId]);

  if (members.length === 0) {
    return <NoEmployeesEmptyState />;
  }

  const inspectorOffsetClass = selectedAppointment ? "lg:pr-80 xl:pr-96" : "";

  return (
    <div
      data-testid="schedule-calendar"
      className="relative flex min-h-0 flex-1 w-full flex-col overflow-hidden rounded-xl border border-border bg-background text-foreground shadow-sm"
    >
      {loadError ? (
        <p role="alert" className="border-b border-destructive/30 px-4 py-2 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      {/* Toolbar and member columns live outside the scroll region. Only the
          hour grid below is allowed to scroll. */}
      <div className={`shrink-0 bg-background rounded-t-xl ${inspectorOffsetClass}`}>
        <div className="px-4 border-b">
          <CalendarToolbar
            currentDate={currentDate}
            onPrevDay={() => shiftDay(-1)}
            onNextDay={() => shiftDay(1)}
            onToday={() => setCurrentDate(getCalendarAnchorDate(timeZone))}
            onDateSelect={setCurrentDate}
            timeZone={timeZone}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            members={members}
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
            onScheduleAppointment={() => {
              if (canCreateAppointment) {
                router.push(`/schedule/new?establishmentId=${encodeURIComponent(establishmentId)}`);
              }
            }}
            canCreateAppointment={canCreateAppointment}
          />
        </div>
      </div>

      <div
        data-testid="schedule-calendar-columns-header"
        className={`shrink-0 bg-background border-b ${inspectorOffsetClass}`}
      >
        {viewMode === "day" && (
          <StaffColumnsHeader
            employees={members}
            visibleEmployees={visibleEmployees}
            startIndex={startIndex}
            maxColumns={maxColumns}
            onShiftLeft={() => setStartIndex(Math.max(0, startIndex - 1))}
            onShiftRight={() => setStartIndex(Math.min(members.length - maxColumns, startIndex + 1))}
          />
        )}
        {viewMode === "week" && (
          <WeekColumnsHeader
            currentDate={currentDate}
            timeZone={timeZone}
            now={now}
          />
        )}
        {viewMode === "month" && (
          <MonthColumnsHeader />
        )}
      </div>

      <div
        data-testid="schedule-calendar-scroll-container"
        className={`scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain ${inspectorOffsetClass}`}
      >
        {viewMode === "day" && (
          <DailyStaffGrid
            currentDate={currentDate}
            visibleEmployees={visibleEmployees}
            appointments={appointments}
            timeZone={timeZone}
            maxColumns={maxColumns}
            now={now}
            onAppointmentClick={setSelectedAppointment}
            onTimeSlotClick={(employeeId) => {
              if (!canCreateAppointment) return;
              router.push(
                `/schedule/new?establishmentId=${encodeURIComponent(establishmentId)}&employeeId=${encodeURIComponent(employeeId)}`
              );
            }}
            customers={customers}
            services={services}
            selectedAppointmentId={selectedAppointment?.id}
          />
        )}
        {viewMode === "week" && (
          <WeekGrid
            currentDate={currentDate}
            appointments={filteredAppointments}
            timeZone={timeZone}
            now={now}
            onAppointmentClick={setSelectedAppointment}
            onTimeSlotClick={() => {
              if (!canCreateAppointment) return;
              router.push(
                `/schedule/new?establishmentId=${encodeURIComponent(establishmentId)}${
                  selectedEmployeeId ? `&employeeId=${encodeURIComponent(selectedEmployeeId)}` : ""
                }`
              );
            }}
            customers={customers}
            services={services}
            selectedAppointmentId={selectedAppointment?.id}
          />
        )}
        {viewMode === "month" && (
          <MonthGrid
            currentDate={currentDate}
            appointments={filteredAppointments}
            timeZone={timeZone}
            now={now}
            onAppointmentClick={setSelectedAppointment}
            onDayClick={(day) => {
              setCurrentDate(day);
              setViewMode("day");
            }}
            customers={customers}
            services={services}
            selectedAppointmentId={selectedAppointment?.id}
          />
        )}
      </div>

      {selectedAppointment && (
        <AppointmentDetailPanel
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
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
          currency={currency}
        />
      )}
    </div>
  );
}
