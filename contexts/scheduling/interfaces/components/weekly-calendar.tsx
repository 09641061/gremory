"use client";

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Appointment } from "../../domain/model/entities/appointment";
import { listAppointmentsAction } from "../actions/list-appointments.action";
import { AppointmentBlock } from "./appointment-block";
import { AppointmentDetailModal } from "./appointment-detail-modal";
import { AppointmentFormModal } from "./appointment-form-modal";
import { MemberResponse } from "../models/member-response";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";

interface WeeklyCalendarProps {
  establishmentId: string;
  services: DetailedServiceDTO[];
  members: MemberResponse[];
  customers: CustomerResponse[];
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

  const getWeekRange = (date: Date) => {
    const current = new Date(date);
    const first = current.getDate() - current.getDay();
    const sunday = new Date(current.setDate(first));
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    return { sunday, saturday };
  };

  const { sunday, saturday } = useMemo(() => getWeekRange(currentDate), [currentDate]);

  const fetchAppointments = useCallback(() => {
    startTransition(async () => {
      const fromStr = sunday.toISOString();
      const toStr = saturday.toISOString();
      const res = await listAppointmentsAction(fromStr, toStr, establishmentId);
      setAppointments(res.content);
    });
  }, [sunday, saturday, establishmentId]);

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

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });

  const formattedMonthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const hours = Array.from({ length: 15 }, (_, i) => 7 + i);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground capitalize">
            {formattedMonthYear}
          </h2>
          <div className="flex items-center border border-border rounded-lg bg-card p-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateWeek("prev")}
              title="Previous Week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateWeek("next")}
              title="Next Week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={navigateToday}>
            Today
          </Button>
        </div>

        <Button size="sm" className="gap-1.5" onClick={() => setIsFormOpen(true)}>
          <Plus className="size-4" />
          Schedule Appointment
        </Button>
      </div>

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
          {isPending ? (
            <div className="space-y-4 p-6">
              <div className="h-10 w-full animate-pulse bg-muted rounded" />
              <div className="h-20 w-full animate-pulse bg-muted rounded" />
              <div className="h-20 w-full animate-pulse bg-muted rounded" />
            </div>
          ) : (
            <div className="relative select-none min-w-[700px]">
              <div className="absolute inset-0 grid grid-cols-[64px_repeat(7,1fr)] pointer-events-none">
                <div className="border-r border-border h-full" />
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="border-r border-border last:border-r-0 h-full" />
                ))}
              </div>

              {hours.map((hour) => {
                const hourFormatted = hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`;
                return (
                  <div key={hour} className="h-20 border-b border-border flex relative">
                    <div className="w-16 border-r border-border shrink-0 flex items-start justify-center pt-2 text-[10px] font-semibold text-muted-foreground">
                      {hourFormatted}
                    </div>

                    <div className="flex-1 grid grid-cols-7 relative">
                      {weekDays.map((day, dayIdx) => {
                        const dayAppts = appointments.filter((appt) => {
                          const apptStart = new Date(appt.startsAt);
                          return (
                            apptStart.toDateString() === day.toDateString() &&
                            apptStart.getHours() === hour
                          );
                        });

                        return (
                          <div key={dayIdx} className="relative p-1 h-full">
                            {dayAppts.map((appt) => (
                              <AppointmentBlock
                                key={appt.id}
                                appointment={appt}
                                onClick={() => handleOpenDetail(appt)}
                              />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isDetailOpen && (
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
