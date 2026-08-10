"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { createAppointmentAction } from "../../actions/create-appointment.action";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { Appointment } from "../../../domain/model/entities/appointment";
import { ActionState } from "../../actions/action-state";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { DateField } from "./date-field";
import { DropdownField } from "./dropdown-field";
import { TimePickerField } from "./time-picker-field";
import {
  computeAppointmentTimes,
  createCustomerOptions,
  createEmployeeOptions,
  createServiceOptions,
} from "./scheduling-form-utils";

interface CreateAppointmentFormProps {
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

export function CreateAppointmentForm({
  establishmentId,
  services,
  members,
  customers,
}: CreateAppointmentFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    initialActionState
  );
  const [isNavigating, startTransition] = useTransition();
  const hasSucceeded = useRef(false);

  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const selectedService = services.find((service) => service.id === selectedServiceId);

  const serviceOptions = useMemo(() => createServiceOptions(services), [services]);
  const customerOptions = useMemo(() => createCustomerOptions(customers), [customers]);
  const employeeOptions = useMemo(() => createEmployeeOptions(members), [members]);

  useEffect(() => {
    if (state.status === "success" && !hasSucceeded.current) {
      hasSucceeded.current = true;
      startTransition(() => {
        router.push("/schedule");
        router.refresh();
      });
    }
  }, [state.status, router, startTransition]);

  const { startsAt, endsAt, formattedEnd } = computeAppointmentTimes({
    startDate,
    startTime,
    durationMinutes: selectedService?.durationMinutes,
  });

  const isWorking = isPending || isNavigating;

  return (
    <div className="bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-8">
        <ErrorAlert
          key={(state.status === "error" ? state.errorId : null) ?? "scheduling-error"}
          title="Scheduling Failed"
          message={state.error ?? undefined}
        />

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="border-b border-border pb-4">
            <h1 className="text-xl font-bold text-foreground">New Appointment</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Fill in the details to schedule a new appointment.
            </p>
          </div>

          <form action={formAction} className="space-y-4 pt-6">
            <input type="hidden" name="establishmentId" value={establishmentId} />
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <div className="space-y-1.5">
              <Label htmlFor="create-title">Appointment Title</Label>
              <Input
                id="create-title"
                name="title"
                placeholder="e.g. Haircut & Beard Trim"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                <TimePickerField
                  id="create-startTime"
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground">Calculated end time</p>
              <p className="text-sm font-medium text-foreground">{formattedEnd || "--"}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" disabled={isWorking} onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isWorking || !startsAt || !endsAt}>
                {isWorking ? "Scheduling..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
