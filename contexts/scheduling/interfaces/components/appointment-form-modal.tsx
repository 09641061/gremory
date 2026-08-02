"use client";

import { useActionState, useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { createAppointmentAction } from "../actions/create-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/ui/error";
import { Appointment } from "../../domain/model/entities/appointment";
import { ActionState } from "../actions/create-appointment.action";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../application/model/scheduling-page-data.view-model";
import { DateField, DropdownField, generateTimeSlots } from "./scheduling-form-fields";

interface AppointmentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  onSuccess: () => void;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

export function AppointmentFormModal({
  isOpen,
  onOpenChange,
  establishmentId,
  services,
  members,
  customers,
  onSuccess,
}: AppointmentFormModalProps) {
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    initialActionState
  );

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const timeSlots = generateTimeSlots();
  const selectedService = services.find((service) => service.id === selectedServiceId);

  const serviceOptions = services.map((service) => ({
    value: service.id,
    label: service.name,
    description: `$${service.price.toFixed(2)} - ${service.durationMinutes} min`,
  }));

  const customerOptions = customers.map((customer) => ({
    value: customer.id,
    label: customer.name,
    description: customer.email || customer.phone || "Customer",
  }));

  const employeeOptions = members.map((member) => ({
    value: member.userId,
    label: member.name,
    description: member.role,
  }));

  const timeOptions = timeSlots.map((slot) => {
    const [h, m] = slot.split(":").map(Number);
    const formatted =
      h! > 12
        ? `${h! - 12}:${String(m!).padStart(2, "0")} PM`
        : h === 12
          ? `12:${String(m!).padStart(2, "0")} PM`
          : `${h}:${String(m!).padStart(2, "0")} AM`;
    return { value: slot, label: formatted };
  });

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
      onOpenChange(false);
    }
  }, [state, onSuccess, onOpenChange]);

  const getCalculatedTimes = () => {
    if (!startDate || !startTime || !selectedServiceId) {
      return { startsAt: "", endsAt: "", formattedEnd: "" };
    }

    const duration = selectedService ? selectedService.durationMinutes : 30;
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
      <ErrorAlert title="Scheduling Failed" message={state.error ?? undefined} />
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="establishmentId" value={establishmentId} />
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <DialogHeader>
              <div className="flex items-center gap-2">
                <Calendar className="text-primary size-5" />
                <DialogTitle>New Appointment</DialogTitle>
              </div>
              <DialogDescription>Fill in the details to schedule a new appointment.</DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="create-title">Appointment Title</Label>
              <Input
                id="create-title"
                name="title"
                placeholder="e.g. Haircut & Beard Trim"
                required
                defaultValue=""
              />
              {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-service">Service</Label>
              <DropdownField
                id="create-service"
                name="serviceId"
                placeholder="Select a service..."
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                options={serviceOptions}
              />
              {state.fieldErrors?.serviceId && <p className="text-xs text-destructive">{state.fieldErrors.serviceId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-customer">Customer</Label>
              <DropdownField
                id="create-customer"
                name="customerId"
                placeholder="Select a customer..."
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={customerOptions}
              />
              {state.fieldErrors?.customerId && <p className="text-xs text-destructive">{state.fieldErrors.customerId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-employee">Employee / Specialist</Label>
              <DropdownField
                id="create-employee"
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
                <Label htmlFor="create-startDate">Start Date</Label>
                <DateField id="create-startDate" placeholder="Select date..." value={startDate} onChange={setStartDate} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-startTime">Start Time</Label>
                <DropdownField
                  id="create-startTime"
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

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !startsAt || !endsAt}>
                {isPending ? "Scheduling..." : "Create Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
