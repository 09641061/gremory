"use client";

import { useActionState, useEffect, useState, useRef, useMemo } from "react";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
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

interface AppointmentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  onSuccess: () => void;
  timeZone: string;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

import { useSchedulingTranslations } from "../../i18n";

export function AppointmentFormModal({
  isOpen,
  onOpenChange,
  establishmentId,
  services,
  members,
  customers,
  onSuccess,
  timeZone,
}: AppointmentFormModalProps) {
  const { t } = useSchedulingTranslations();
  const [state, formAction, isPending] = useActionState(
    createAppointmentAction,
    initialActionState
  );
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
      onSuccess();
      onOpenChange(false);
    }
  }, [state.status, onSuccess, onOpenChange]);

  const { startsAt, endsAt, formattedEnd } = computeAppointmentTimes({
    startDate,
    startTime,
    durationMinutes: selectedService?.durationMinutes,
    timeZone,
  });

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <ErrorAlert
            key={(state.status === "error" ? state.errorId : null) ?? "scheduling-error"}
            title={t.form.schedulingFailed}
            message={state.error ?? undefined}
          />
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="establishmentId" value={establishmentId} />
            <input type="hidden" name="startsAt" value={startsAt} />
            <input type="hidden" name="endsAt" value={endsAt} />

            <DialogHeader>
              <div className="flex items-center gap-2">
                <Calendar className="text-primary size-5" />
                <DialogTitle>{t.form.newAppointmentTitle}</DialogTitle>
              </div>
              <DialogDescription>{t.form.newAppointmentSubtitle}</DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="create-title">{t.form.appointmentTitleLabel}</Label>
              <Input
                id="create-title"
                name="title"
                placeholder={t.form.appointmentTitlePlaceholder}
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {state.fieldErrors?.title && <p className="text-xs text-destructive">{state.fieldErrors.title[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-service">{t.form.serviceLabel}</Label>
              <DropdownField
                id="create-service"
                name="serviceId"
                placeholder={t.form.selectServicePlaceholder}
                value={selectedServiceId}
                onChange={setSelectedServiceId}
                options={serviceOptions}
              />
              {state.fieldErrors?.serviceId && <p className="text-xs text-destructive">{state.fieldErrors.serviceId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-customer">{t.form.customerLabel}</Label>
              <DropdownField
                id="create-customer"
                name="customerId"
                placeholder={t.form.selectCustomerPlaceholder}
                value={selectedCustomerId}
                onChange={setSelectedCustomerId}
                options={customerOptions}
              />
              {state.fieldErrors?.customerId && <p className="text-xs text-destructive">{state.fieldErrors.customerId[0]}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="create-employee">{t.form.employeeLabel}</Label>
              <DropdownField
                id="create-employee"
                name="employeeId"
                placeholder={t.form.selectEmployeePlaceholder}
                value={selectedEmployeeId}
                onChange={setSelectedEmployeeId}
                options={employeeOptions}
              />
              {state.fieldErrors?.employeeId && <p className="text-xs text-destructive">{state.fieldErrors.employeeId[0]}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-startDate">{t.form.dateLabel}</Label>
                <DateField id="create-startDate" placeholder={t.form.selectDatePlaceholder} value={startDate} onChange={setStartDate} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-startTime">{t.form.timeLabel}</Label>
                <TimePickerField
                  id="create-startTime"
                  value={startTime}
                  onChange={setStartTime}
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.form.calculatedEndTime}</p>
              <p className="text-sm font-medium text-foreground">{formattedEnd || "--"}</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
                {t.form.cancel}
              </Button>
              <Button type="submit" disabled={isPending || !startsAt || !endsAt}>
                {isPending ? t.form.scheduling : t.form.createAppointment}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
