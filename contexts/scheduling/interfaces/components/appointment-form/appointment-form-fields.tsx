"use client";

import { useMemo } from "react";
import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { DateField } from "./date-field";
import { DropdownField } from "./dropdown-field";
import { TimePickerField } from "./time-picker-field";
import {
  createCustomerOptions,
  createEmployeeOptions,
  createServiceOptions,
} from "./scheduling-form-utils";
import type { AppointmentFormValues } from "./types";

interface AppointmentFormFieldsProps {
  /** Prefix that keeps element ids unique when two forms coexist in the DOM. */
  idPrefix: string;
  values: AppointmentFormValues;
  onChange: <K extends keyof AppointmentFormValues>(
    field: K,
    value: AppointmentFormValues[K]
  ) => void;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  fieldErrors: Record<string, string[]> | null;
  formattedEnd: string;
  /** Earliest selectable day as `YYYY-MM-DD`; omitted when past dates are allowed. */
  minDate?: string;
}

function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  if (!messages?.length) return null;
  return (
    <p id={id} className="text-xs text-destructive">
      {messages[0]}
    </p>
  );
}

/**
 * The field set shared by the create and reschedule flows.
 *
 * Both forms collect exactly the same appointment data; only the surrounding
 * chrome and the Server Action differ, so the fields live in one place.
 */
export function AppointmentFormFields({
  idPrefix,
  values,
  onChange,
  services,
  members,
  customers,
  fieldErrors,
  formattedEnd,
  minDate,
}: AppointmentFormFieldsProps) {
  const serviceOptions = useMemo(() => createServiceOptions(services), [services]);
  const customerOptions = useMemo(() => createCustomerOptions(customers), [customers]);
  const employeeOptions = useMemo(() => createEmployeeOptions(members), [members]);

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-title`}>Appointment title</Label>
        <Input
          id={`${idPrefix}-title`}
          name="title"
          placeholder="e.g. Haircut & Beard Trim"
          required
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          aria-invalid={Boolean(fieldErrors?.title)}
          aria-describedby={fieldErrors?.title ? `${idPrefix}-title-error` : undefined}
        />
        <FieldError id={`${idPrefix}-title-error`} messages={fieldErrors?.title} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-service`}>Service</Label>
        <DropdownField
          id={`${idPrefix}-service`}
          name="serviceId"
          placeholder="Select a service..."
          value={values.serviceId}
          onChange={(value) => onChange("serviceId", value)}
          options={serviceOptions}
          emptyMessage="No services available"
        />
        <FieldError id={`${idPrefix}-service-error`} messages={fieldErrors?.serviceId} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-customer`}>Customer</Label>
        <DropdownField
          id={`${idPrefix}-customer`}
          name="customerId"
          placeholder="Select a customer..."
          value={values.customerId}
          onChange={(value) => onChange("customerId", value)}
          options={customerOptions}
          emptyMessage="No customers available"
        />
        <FieldError id={`${idPrefix}-customer-error`} messages={fieldErrors?.customerId} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-employee`}>Employee / specialist</Label>
        <DropdownField
          id={`${idPrefix}-employee`}
          name="employeeId"
          placeholder="Select an employee..."
          value={values.employeeId}
          onChange={(value) => onChange("employeeId", value)}
          options={employeeOptions}
          emptyMessage="No employees available"
        />
        <FieldError id={`${idPrefix}-employee-error`} messages={fieldErrors?.employeeId} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-start-date`}>Date</Label>
          <DateField
            id={`${idPrefix}-start-date`}
            placeholder="Select date..."
            value={values.startDate}
            onChange={(value) => onChange("startDate", value)}
            min={minDate}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-start-time`}>Time</Label>
          <TimePickerField
            id={`${idPrefix}-start-time`}
            value={values.startTime}
            onChange={(value) => onChange("startTime", value)}
          />
        </div>
      </div>

      <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-xs font-semibold text-muted-foreground">Calculated end time</p>
        <p aria-live="polite" className="text-sm font-medium text-foreground">
          {formattedEnd || "Pick a service, date and time"}
        </p>
      </div>
    </div>
  );
}
