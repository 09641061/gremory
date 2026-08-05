"use client";

import { useActionState, useEffect, useState, useRef, useMemo } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { updateAppointmentAction } from "../../actions/update-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../../domain/model/entities/appointment";
import { ActionState } from "../../actions/action-state";
import { DeleteConfirmDialog } from "../confirm-dialogs/delete-confirm-dialog";
import { DateField } from "./date-field";
import { DropdownField } from "./dropdown-field";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import {
  computeAppointmentTimes,
  createCustomerOptions,
  createEmployeeOptions,
  createServiceOptions,
  createTimeOptions,
} from "./scheduling-form-utils";
import { TIME_SLOTS } from "./time-slots";

interface RescheduleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  onSuccess: (updatedAppointment: Appointment) => void;
  onDeleteSuccess: () => void;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
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
  const appointmentIdRef = useRef(appointment.id);
  
  useEffect(() => {
    appointmentIdRef.current = appointment.id;
  }, [appointment.id]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) => {
      return await updateAppointmentAction(appointmentIdRef.current, prevState, formData);
    },
    initialActionState
  );

  const hasSucceeded = useRef(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [title, setTitle] = useState(appointment.title);
  const [selectedServiceId, setSelectedServiceId] = useState(appointment.serviceId ?? "");
  const [selectedCustomerId, setSelectedCustomerId] = useState(appointment.customerId ?? "");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(appointment.employeeId ?? "");

  const existingStart = new Date(appointment.startsAt);
  const initDate = `${existingStart.getFullYear()}-${String(existingStart.getMonth() + 1).padStart(2, "0")}-${String(existingStart.getDate()).padStart(2, "0")}`;
  const initTime = `${String(existingStart.getHours()).padStart(2, "0")}:${String(existingStart.getMinutes()).padStart(2, "0")}`;

  const [startDate, setStartDate] = useState(initDate);
  const [startTime, setStartTime] = useState(initTime);

  const selectedService = services.find((service) => service.id === selectedServiceId);
  
  const serviceOptions = useMemo(() => createServiceOptions(services), [services]);
  const customerOptions = useMemo(() => createCustomerOptions(customers), [customers]);
  const employeeOptions = useMemo(() => createEmployeeOptions(members), [members]);
  const timeOptions = useMemo(() => createTimeOptions(TIME_SLOTS), []);

  // Sincronizar el estado del formulario de forma segura si el prop cambia
  const [prevAppointmentId, setPrevAppointmentId] = useState(appointment.id);
  if (appointment.id !== prevAppointmentId) {
    setPrevAppointmentId(appointment.id);
    setTitle(appointment.title);
    setSelectedServiceId(appointment.serviceId ?? "");
    setSelectedCustomerId(appointment.customerId ?? "");
    setSelectedEmployeeId(appointment.employeeId ?? "");
    const currentStart = new Date(appointment.startsAt);
    setStartDate(`${currentStart.getFullYear()}-${String(currentStart.getMonth() + 1).padStart(2, "0")}-${String(currentStart.getDate()).padStart(2, "0")}`);
    setStartTime(`${String(currentStart.getHours()).padStart(2, "0")}:${String(currentStart.getMinutes()).padStart(2, "0")}`);
  }

  useEffect(() => {
    if (state.status === "success" && state.data && !hasSucceeded.current) {
      hasSucceeded.current = true;
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state.status, state.data, onSuccess, onOpenChange]);

  const { startsAt, endsAt, formattedEnd } = computeAppointmentTimes({
    startDate,
    startTime,
    durationMinutes: selectedService?.durationMinutes,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <ErrorAlert
            key={(state.status === "error" ? state.errorId : null) ?? "update-error"}
            title="Update Failed"
            message={state.error ?? undefined}
          />
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

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-title">Appointment Title</Label>
              <Input id="reschedule-title" name="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-service">Service</Label>
              <DropdownField
                id="reschedule-service"
                name="serviceId"
                placeholder="Select a service..."
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                options={serviceOptions}
              />
              {state.fieldErrors?.serviceId && <p className="text-xs text-destructive">{state.fieldErrors.serviceId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-customer">Customer</Label>
              <DropdownField
                id="reschedule-customer"
                name="customerId"
                placeholder="Select a customer..."
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={customerOptions}
              />
              {state.fieldErrors?.customerId && <p className="text-xs text-destructive">{state.fieldErrors.customerId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reschedule-employee">Employee / Specialist</Label>
              <DropdownField
                id="reschedule-employee"
                name="employeeId"
                placeholder="Select an employee..."
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                options={employeeOptions}
              />
              {state.fieldErrors?.employeeId && <p className="text-xs text-destructive">{state.fieldErrors.employeeId[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startDate">Date</Label>
                <DateField id="reschedule-startDate" placeholder="Select date..." value={startDate} onChange={setStartDate} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reschedule-startTime">Time</Label>
                <DropdownField
                  id="reschedule-startTime"
                  name="startTime"
                  placeholder="Select time..."
                  value={startTime}
                  onChange={setStartTime}
                  options={timeOptions}
                />
              </div>
            </div>

            {startsAt && endsAt && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Calculated End Time</p>
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
