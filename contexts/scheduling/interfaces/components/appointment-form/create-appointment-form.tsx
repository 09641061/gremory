"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Spinner } from "@/contexts/shared/interfaces/components/ui/spinner";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { createAppointmentAction } from "../../actions/create-appointment.action";
import type { Appointment } from "../../../domain/model/entities/appointment";
import type { ActionState } from "../../actions/action-state";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import { AppointmentFormFields } from "./appointment-form-fields";
import { computeAppointmentTimes } from "./scheduling-form-utils";
import { EMPTY_APPOINTMENT_FORM_VALUES, type AppointmentFormValues } from "./types";
import { toTimeZoneDayKey } from "../scheduling-timezone.utils";
import { useNow } from "../use-now";

interface CreateAppointmentFormProps {
  establishmentId: string;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  timeZone: string;
}

const initialActionState: ActionState<Appointment> = {
  status: "idle",
  data: null,
  error: null,
  fieldErrors: null,
};

import { useSchedulingTranslations } from "../../i18n";

export function CreateAppointmentForm({
  establishmentId,
  services,
  members,
  customers,
  timeZone,
}: CreateAppointmentFormProps) {
  const { t } = useSchedulingTranslations();
  const router = useRouter();
  const [state, formAction, isSubmitting] = useActionState(
    createAppointmentAction,
    initialActionState
  );
  const [isNavigating, startTransition] = useTransition();
  const hasSucceeded = useRef(false);

  const [values, setValues] = useState<AppointmentFormValues>(EMPTY_APPOINTMENT_FORM_VALUES);

  const updateField = <K extends keyof AppointmentFormValues>(
    field: K,
    value: AppointmentFormValues[K]
  ) => setValues((current) => ({ ...current, [field]: value }));

  const now = useNow();
  const selectedService = services.find((service) => service.id === values.serviceId);
  const { startsAt, endsAt, formattedEnd } = computeAppointmentTimes({
    startDate: values.startDate,
    startTime: values.startTime,
    durationMinutes: selectedService?.durationMinutes,
    timeZone,
  });

  useEffect(() => {
    if (state.status === "success" && !hasSucceeded.current) {
      hasSucceeded.current = true;
      startTransition(() => {
        router.push("/schedule");
        router.refresh();
      });
    }
  }, [state.status, router]);

  const isWorking = isSubmitting || isNavigating;

  return (
    <>
      <ErrorAlert
        key={(state.status === "error" ? state.errorId : null) ?? "scheduling-error"}
        title={t.form.schedulingFailed}
        message={state.error ?? undefined}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="border-b border-border pb-4">
          <h1 className="text-xl font-bold text-foreground">{t.form.newAppointmentTitle}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t.form.newAppointmentSubtitle}
          </p>
        </div>

        <form action={formAction} className="space-y-4 pt-6">
          <input type="hidden" name="establishmentId" value={establishmentId} />
          <input type="hidden" name="startsAt" value={startsAt} />
          <input type="hidden" name="endsAt" value={endsAt} />

          <AppointmentFormFields
            idPrefix="create-appointment"
            values={values}
            onChange={updateField}
            services={services}
            members={members}
            customers={customers}
            fieldErrors={state.status === "error" ? state.fieldErrors : null}
            formattedEnd={formattedEnd}
            minDate={now === null ? undefined : toTimeZoneDayKey(new Date(now), timeZone)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isWorking}
              onClick={() => router.back()}
            >
              {t.form.cancel}
            </Button>
            <Button type="submit" disabled={isWorking || !startsAt} className="gap-2">
              {isWorking && <Spinner className="size-4" />}
              {isWorking ? t.form.scheduling : t.form.createAppointment}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
