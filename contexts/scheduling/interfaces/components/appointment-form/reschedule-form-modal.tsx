"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CalendarClock, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { updateAppointmentAction } from "../../actions/update-appointment.action";
import type { Appointment } from "../../../domain/model/entities/appointment";
import type { ActionState } from "../../actions/action-state";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { DeleteConfirmDialog } from "../confirm-dialogs/delete-confirm-dialog";
import { AppointmentFormFields } from "./appointment-form-fields";
import { computeAppointmentTimes } from "./scheduling-form-utils";
import type { AppointmentFormValues } from "./types";
import { toDateInputValue, toTimeInputValue } from "../scheduling-datetime";

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

function toFormValues(appointment: Appointment): AppointmentFormValues {
  const start = new Date(appointment.startsAt);
  return {
    title: appointment.title,
    serviceId: appointment.serviceId ?? "",
    customerId: appointment.customerId ?? "",
    employeeId: appointment.employeeId ?? "",
    startDate: toDateInputValue(start),
    startTime: toTimeInputValue(start),
  };
}

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
  // Keeps the submitted id current without re-creating the action identity.
  const appointmentIdRef = useRef(appointment.id);
  useEffect(() => {
    appointmentIdRef.current = appointment.id;
  }, [appointment.id]);

  const [state, formAction, isPending] = useActionState(
    async (prevState: ActionState<Appointment>, formData: FormData) =>
      updateAppointmentAction(appointmentIdRef.current, prevState, formData),
    initialActionState
  );

  const hasSucceeded = useRef(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [values, setValues] = useState(() => toFormValues(appointment));

  // Re-seed the fields when the modal is pointed at a different appointment.
  const [prevAppointmentId, setPrevAppointmentId] = useState(appointment.id);
  if (appointment.id !== prevAppointmentId) {
    setPrevAppointmentId(appointment.id);
    setValues(toFormValues(appointment));
  }

  const updateField = <K extends keyof AppointmentFormValues>(
    field: K,
    value: AppointmentFormValues[K]
  ) => setValues((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    if (state.status === "success" && state.data && !hasSucceeded.current) {
      hasSucceeded.current = true;
      onSuccess(state.data);
      onOpenChange(false);
    }
  }, [state.status, state.data, onSuccess, onOpenChange]);

  const selectedService = services.find((service) => service.id === values.serviceId);
  const { startsAt, endsAt, formattedEnd } = computeAppointmentTimes({
    startDate: values.startDate,
    startTime: values.startTime,
    durationMinutes: selectedService?.durationMinutes,
  });

  return (
    <>
      <ErrorAlert
        key={(state.status === "error" ? state.errorId : null) ?? "update-error"}
        title="Update failed"
        message={state.error ?? undefined}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-5 text-primary" />
              <DialogTitle>Edit appointment</DialogTitle>
            </div>
            <DialogDescription>
              Modify the details, assignee, customer and schedule in one place.
            </DialogDescription>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <AppointmentFormFields
              idPrefix="reschedule-appointment"
              values={values}
              onChange={updateField}
              services={services}
              members={members}
              customers={customers}
              fieldErrors={state.status === "error" ? state.fieldErrors : null}
              formattedEnd={formattedEnd}
            />

            <DialogFooter className="flex-col items-stretch gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="justify-center gap-1.5 text-destructive hover:bg-destructive/10 sm:justify-start"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
              <div className="flex flex-col justify-end gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !startsAt} className="gap-2">
                  {isPending && <Spinner className="size-4" />}
                  {isPending ? "Saving..." : "Confirm changes"}
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
          appointmentTitle={appointment.title}
          onSuccess={() => {
            onDeleteSuccess();
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
