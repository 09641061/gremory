"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Appointment } from "../../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../../actions/list-appointments.action";
import { AppointmentDetailModal } from "../appointment-detail/appointment-detail-modal";
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
}: DailyStaffCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => getCalendarAnchorDate(timeZone));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [, startTransition] = useTransition();
  const [startIndex, setStartIndex] = useState(0);
  const maxColumns = 6;
  const requestIdRef = useRef(0);
  const now = useNow();

  const fetchAppointments = useCallback(() => {
    const requestId = ++requestIdRef.current;

    startTransition(async () => {
      const result = await listAppointmentsAction(
        calendarDateToZonedIso(currentDate, timeZone, false),
        calendarDateToZonedIso(currentDate, timeZone, true),
        establishmentId
      );
      if (requestId === requestIdRef.current) {
        setAppointments(result.content);
      }
    });
  }, [currentDate, establishmentId, timeZone, startTransition]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const shiftDay = (direction: -1 | 1) => {
    setCurrentDate((current) => addCalendarDays(current, direction));
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

  if (members.length === 0) {
    return <NoEmployeesEmptyState />;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] w-full flex-col bg-background text-foreground rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="px-4 border-b">
        <CalendarToolbar
          currentDate={currentDate}
          onPrevDay={() => shiftDay(-1)}
          onNextDay={() => shiftDay(1)}
          onToday={() => setCurrentDate(getCalendarAnchorDate(timeZone))}
          onDateSelect={setCurrentDate}
          timeZone={timeZone}
          onScheduleAppointment={() => {
            if (canCreateAppointment) router.push("/schedule/new");
          }}
        />
      </div>

      <StaffColumnsHeader
        employees={members}
        visibleEmployees={visibleEmployees}
        startIndex={startIndex}
        maxColumns={maxColumns}
        onShiftLeft={() => setStartIndex(Math.max(0, startIndex - 1))}
        onShiftRight={() => setStartIndex(Math.min(members.length - maxColumns, startIndex + 1))}
      />

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
          router.push(`/schedule/new?employeeId=${employeeId}`);
        }}
      />

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
