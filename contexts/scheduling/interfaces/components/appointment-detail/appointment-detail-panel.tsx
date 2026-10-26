"use client";

import { useState } from "react";
import { Check, Phone, Play, RotateCcw, UserX, X } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { Appointment } from "../../../domain/model/entities/appointment";
import { CancelConfirmDialog } from "../confirm-dialogs/cancel-confirm-dialog";
import {
  AppointmentStatusConfirmDialog,
  type AppointmentStatusTransition,
} from "../confirm-dialogs/appointment-status-confirm-dialog";
import { RescheduleFormModal } from "../appointment-form/reschedule-form-modal";
import { formatTimeInTimeZone } from "../scheduling-timezone.utils";
import {
  findAppointmentCustomer,
  findAppointmentEmployee,
  findAppointmentService,
} from "./appointment-detail-utils";
import { useSchedulingTranslations } from "../../i18n";

type OpenFlow = AppointmentStatusTransition | "reschedule" | "cancel" | null;

interface AppointmentDetailPanelProps {
  appointment: Appointment;
  onClose: () => void;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  onUpdate: (updated: Appointment) => void;
  onDeleteSuccess: () => void;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
  timeZone: string;
  currency?: "USD" | "PEN";
}

function StatusBadge({
  status,
  t,
}: {
  status: Appointment["status"];
  t: ReturnType<typeof useSchedulingTranslations>["t"];
}) {
  switch (status) {
    case "CONFIRMED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <Check className="size-3.5" />
          <span>{t.status.confirmed}</span>
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Play className="size-3.5 fill-current" />
          <span>{t.status.inProgress}</span>
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="size-3.5" />
          <span>{t.status.completed}</span>
        </span>
      );
    case "CANCELLED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
          <X className="size-3.5" />
          <span>{t.status.cancelled}</span>
        </span>
      );
    case "NO_SHOW":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          <UserX className="size-3.5" />
          <span>{t.status.noShow}</span>
        </span>
      );
    default:
      return null;
  }
}

export function AppointmentDetailPanel({
  appointment,
  onClose,
  services,
  members,
  customers,
  onUpdate,
  onDeleteSuccess,
  canUpdateAppointment,
  canDeleteAppointment,
  timeZone,
  currency = "PEN",
}: AppointmentDetailPanelProps) {
  const { t, locale } = useSchedulingTranslations();
  const dateLocale = locale === "es" ? "es-ES" : "en-US";
  const [openFlow, setOpenFlow] = useState<OpenFlow>(null);

  const service = findAppointmentService(services, appointment);
  const customer = findAppointmentCustomer(customers, appointment);
  const employee = findAppointmentEmployee(members, appointment);

  const startTime = formatTimeInTimeZone(new Date(appointment.startsAt), timeZone, dateLocale);
  const endTime = formatTimeInTimeZone(new Date(appointment.endsAt), timeZone, dateLocale);
  const currencySymbol = currency === "PEN" ? "S/" : "$";
  const servicePrice = service?.price !== undefined ? Number(service.price).toFixed(2) : "0.00";

  const isConfirmed = appointment.status === "CONFIRMED";
  const isInProgress = appointment.status === "IN_PROGRESS";

  const closeFlow = () => setOpenFlow(null);
  const handleTransitionSuccess = (updated: Appointment) => {
    onUpdate(updated);
    closeFlow();
  };

  return (
    <>
      <aside
        data-testid="appointment-detail-panel"
        className="absolute inset-y-0 right-0 z-30 flex w-full sm:w-80 md:w-96 flex-col border-l border-border bg-card shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <StatusBadge status={appointment.status} t={t} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-full"
            onClick={onClose}
            aria-label={t.appointmentDetail.close}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Customer info */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-foreground">
              {customer?.name ?? appointment.title}
            </h2>
            {customer?.phone && (
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                <Phone className="size-3.5" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Service, Time, Price & Employee */}
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">
              {service?.name ?? appointment.title}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {startTime} – {endTime} · {currencySymbol} {servicePrice} · {employee?.name ?? t.appointmentDetail.unknown}
            </p>
          </div>

          {/* Note Box */}
          <div className="rounded-lg bg-muted/50 p-3.5 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              {t.appointmentDetail.notes}
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {appointment.notes || appointment.cancellationReason || t.appointmentDetail.noNotes}
            </p>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="mt-auto border-t border-border p-4 space-y-3">
          {isConfirmed && canUpdateAppointment && (
            <Button
              type="button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
              onClick={() => setOpenFlow("start")}
            >
              <Play className="size-4 fill-current" />
              <span>{t.appointmentDetail.start}</span>
            </Button>
          )}

          {isInProgress && canUpdateAppointment && (
            <Button
              type="button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-medium"
              onClick={() => setOpenFlow("complete")}
            >
              <Check className="size-4" />
              <span>{t.appointmentDetail.complete}</span>
            </Button>
          )}

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpenFlow("reschedule")}
              disabled={!(canUpdateAppointment && isConfirmed)}
              title={t.appointmentDetail.reschedule}
              aria-label={t.appointmentDetail.reschedule}
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpenFlow("no-show")}
              disabled={!(canUpdateAppointment && isConfirmed)}
              title={t.appointmentDetail.noShow}
              aria-label={t.appointmentDetail.noShow}
            >
              <UserX className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setOpenFlow("cancel")}
              disabled={!(canDeleteAppointment && (isConfirmed || isInProgress))}
              title={t.appointmentDetail.cancel}
              aria-label={t.appointmentDetail.cancel}
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Secondary confirmation dialogs */}
      {openFlow === "reschedule" && (
        <RescheduleFormModal
          isOpen
          onOpenChange={closeFlow}
          appointment={appointment}
          services={services}
          members={members}
          customers={customers}
          onSuccess={handleTransitionSuccess}
          onDeleteSuccess={() => {
            onDeleteSuccess();
            onClose();
          }}
          timeZone={timeZone}
        />
      )}

      {openFlow === "cancel" && (
        <CancelConfirmDialog
          isOpen
          onOpenChange={closeFlow}
          appointmentId={appointment.id}
          onSuccess={(updated) => {
            onUpdate(updated);
            closeFlow();
          }}
        />
      )}

      {(openFlow === "start" || openFlow === "complete" || openFlow === "no-show") && (
        <AppointmentStatusConfirmDialog
          isOpen
          onOpenChange={closeFlow}
          transition={openFlow}
          appointmentId={appointment.id}
          onSuccess={handleTransitionSuccess}
        />
      )}
    </>
  );
}
