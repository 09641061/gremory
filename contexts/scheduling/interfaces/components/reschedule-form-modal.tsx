"use client";

import { useActionState, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { updateAppointmentAction } from "../actions/update-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "../actions/create-appointment.action";
import { MemberResponse } from "../models/member-response";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { CalendarClock, Trash2 } from "lucide-react";
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
      return await updateAppointmentAction(appointment.id, prevState, formData);
    },
    initialActionState
  );

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Parse existing appointment values
  const [title, setTitle] = useState(appointment.title);
  const [selectedServiceId, setSelectedServiceId] = useState(appointment.serviceId ?? "");
  const [selectedCustomerId, setSelectedCustomerId] = useState(appointment.customerId ?? "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(appointment.employeeId ?? "");

  const existingStart = new Date(appointment.startsAt);
  const initDate = `${existingStart.getFullYear()}-${String(existingStart.getMonth() + 1).padStart(2, "0")}-${String(existingStart.getDate()).padStart(2, "0")}`;
  const initTime = `${String(existingStart.getHours()).padStart(2, "0")}:${String(existingStart.getMinutes()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(initDate);
  const [startTime, setStartTime] = useState(initTime);

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    if (state.status === "success" && state.data) {
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  // Calculate dynamic end time based on service duration
  const getCalculatedTimes = () => {
    if (!startDate || !startTime || !selectedServiceId) {
      return { startsAt: "", endsAt: "", formattedEnd: "" };
    }

    const service = services.find((s) => s.id === selectedServiceId);
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
      <ErrorAlert title="Update Failed" message={state.error ?? undefined} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <DialogHeader>
              <div className="flex items-center gap-2">
                <CalendarClock className="text-primary size-5" />
                <DialogTitle>Edit Appointment</DialogTitle>
              </div>
              <DialogDescription>
                Modify appointment details, assignee, customer, and schedules in one place.
              </DialogDescription>
            </DialogHeader>

            {/* Title field */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-title">Appointment Title</Label>
              <Input
                id="reschedule-title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            {/* Service Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-service">Service</Label>
              <select
                id="reschedule-service"
                name="serviceId"
                required
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className={selectClassName}
              >
                <option value="">Select a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} (${service.price} - {service.durationMinutes} min)
                  </option>
                ))}
              </select>
              {state.fieldErrors?.serviceId && (
                <p className="text-xs text-destructive">{state.fieldErrors.serviceId[0]}</p>
              )}
            </div>

            {/* Customer Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-customer">Customer</Label>
              <select
                id="reschedule-customer"
                name="customerId"
                required
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className={selectClassName}
              >
                <option value="">Select a customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {state.fieldErrors?.customerId && (
                <p className="text-xs text-destructive">{state.fieldErrors.customerId[0]}</p>
              )}
            </div>

            {/* Employee Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="reschedule-employee">Employee / Specialist</Label>
              <select
                id="reschedule-employee"
                name="employeeId"
                required
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className={selectClassName}
              >
                <option value="">Select an employee...</option>
                {members.map((member) => (
                  <option key={member.id} value={member.userId}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
              {state.fieldErrors?.employeeId && (
                <p className="text-xs text-destructive">{state.fieldErrors.employeeId[0]}</p>
              )}
            </div>

            {/* Date & Time selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startDate">Date</Label>
                <Input
                  id="reschedule-startDate"
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startTime">Time</Label>
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

            <DialogFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2">
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
