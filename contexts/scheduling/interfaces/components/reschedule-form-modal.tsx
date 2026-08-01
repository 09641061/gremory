"use client";

import { useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Textarea } from "@/contexts/shared/interfaces/components/ui/textarea";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { rescheduleAppointmentAction } from "../actions/reschedule-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "../actions/create-appointment.action";
import { MemberResponse } from "../models/member-response";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { CalendarClock, Tag, User, UserCheck, Trash2 } from "lucide-react";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

interface RescheduleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  services: DetailedServiceDTO[];
  members: MemberResponse[];
  customers: CustomerResponse[];
  onSuccess: (updatedAppointment: Appointment) => void;
  onDeleteSuccess: () => void;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

const selectClassName =
  "appearance-none h-9 w-full min-w-0 rounded-lg border border-border bg-transparent px-3 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-50 md:text-sm dark:bg-muted/30";

// Generate options for time slots from 07:00 AM to 09:00 PM in 15-minute intervals
const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === 21 && minute > 0) break; // End at exactly 9:00 PM
      const hStr = String(hour).padStart(2, "0");
      const mStr = String(minute).padStart(2, "0");
      slots.push(`${hStr}:${mStr}`);
    }
  }
  return slots;
};

export function RescheduleFormModal({
  isOpen,
  onOpenChange,
  appointment,
  services,
  members,
  customers,
  onSuccess,
  onDeleteSuccess,
}: RescheduleFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) => {
      return await rescheduleAppointmentAction(appointment.id, prevState, formData);
    },
    initialActionState
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Parse existing appointment start to initialize date/time fields
  const existingStart = new Date(appointment.startsAt);
  const initDate = `${existingStart.getFullYear()}-${String(existingStart.getMonth() + 1).padStart(2, "0")}-${String(existingStart.getDate()).padStart(2, "0")}`;
  const initTime = `${String(existingStart.getHours()).padStart(2, "0")}:${String(existingStart.getMinutes()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(initDate);
  const [startTime, setStartTime] = useState(initTime);

  const timeSlots = generateTimeSlots();

  // Resolve related entities for display
  const service = services.find((s) => s.id === appointment.serviceId);
  const customer = customers.find((c) => c.id === appointment.customerId);
  const employee = members.find((m) => m.userId === appointment.employeeId);

  useEffect(() => {
    if (state.status === "success" && state.data) {
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  // Calculate dynamic end time based on service duration
  const getCalculatedTimes = () => {
    if (!startDate || !startTime) {
      return { startsAt: "", endsAt: "", formattedEnd: "" };
    }

    const duration = service ? service.durationMinutes : 30; // default 30 min fallback

    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);
    const [startHour, startMin] = startTime.split(":").map(Number);

    const startDateTime = new Date(startYear!, startMonth! - 1, startDay!, startHour!, startMin!, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

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

    return {
      startsAt: toLocalISOString(startDateTime),
      endsAt: toLocalISOString(endDateTime),
      formattedEnd: `${endDateTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })} (${duration} mins duration)`,
    };
  };

  const { startsAt, endsAt, formattedEnd } = getCalculatedTimes();

  return (
    <>
      <ErrorAlert title="Rescheduling Failed" message={state.error ?? undefined} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <DialogHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="text-primary size-5" />
                <DialogTitle>Reschedule Appointment</DialogTitle>
              </div>
              <DialogDescription>
                Modify the date and time of this appointment. This will check for any conflicting schedules.
              </DialogDescription>
            </DialogHeader>

            {/* Read-only appointment info summary */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm">
                <Tag className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium text-foreground">{service?.name ?? "Unknown"}</span>
                {service && (
                  <span className="text-xs text-muted-foreground">
                    ({service.durationMinutes} min)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium text-foreground">{customer?.name ?? "Unknown"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Employee:</span>
                <span className="font-medium text-foreground">{employee?.name ?? employee?.email ?? "Unknown"}</span>
              </div>
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startDate">New Date</Label>
                <Input
                  id="reschedule-startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startTime">New Time</Label>
                <select
                  id="reschedule-startTime"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={selectClassName}
                >
                  <option value="">Select time...</option>
                  {timeSlots.map((slot) => {
                    const [h, m] = slot.split(":").map(Number);
                    const formatted =
                      h! > 12
                        ? `${h! - 12}:${String(m!).padStart(2, "0")} PM`
                        : h === 12
                          ? `12:${String(m!).padStart(2, "0")} PM`
                          : `${h}:${String(m!).padStart(2, "0")} AM`;
                    return (
                      <option key={slot} value={slot}>
                        {formatted}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Calculated end time display */}
            {startsAt && endsAt && (
              <div className="p-3 bg-muted/40 rounded-lg border border-border space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Calculated End Time</p>
                <p className="text-sm font-medium text-foreground">{formattedEnd}</p>
              </div>
            )}

            {/* Rescheduling reason */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-reason">Rescheduling Reason</Label>
              <Textarea
                id="reschedule-reason"
                name="reason"
                placeholder="Client requested to change time..."
                className="min-h-[80px]"
              />
              {state.fieldErrors?.reason && (
                <p className="text-xs text-destructive">{state.fieldErrors.reason[0]}</p>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 justify-center sm:justify-start gap-1.5"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !startsAt || !endsAt}>
                  {isPending ? "Saving..." : "Confirm Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isDeleteOpen && (
        <DeleteConfirmDialog
          isOpen={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          appointmentId={appointment.id}
          onSuccess={() => {
            onDeleteSuccess();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
