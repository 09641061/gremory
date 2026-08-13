"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/contexts/shared/interfaces/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
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
import { AppointmentDetailActions } from "./appointment-detail-actions";
import { AppointmentDetailInfo } from "./appointment-detail-info";
import { AppointmentDetailSummary } from "./appointment-detail-summary";
import { useNow } from "../use-now";
import { formatTimeInTimeZone } from "../scheduling-timezone.utils";
import {
  findAppointmentCustomer,
  findAppointmentEmployee,
  findAppointmentService,
  formatAppointmentDate,
  formatAppointmentTime,
  getAppointmentStatusClasses,
  getAppointmentStatusLabel,
} from "./appointment-detail-utils";

/** Only one secondary flow can be open at a time, so one slot models them all. */
type OpenFlow = AppointmentStatusTransition | "reschedule" | "cancel" | null;

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  services: SchedulingServiceViewModel[];
  members: SchedulingMemberViewModel[];
  customers: SchedulingCustomerViewModel[];
  onUpdate: (updated: Appointment) => void;
  onDeleteSuccess: () => void;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
  timeZone: string;
}

export function AppointmentDetailModal({
  isOpen,
  onOpenChange,
  appointment,
  services,
  members,
  customers,
  onUpdate,
  onDeleteSuccess,
  canUpdateAppointment,
  canDeleteAppointment,
  timeZone,
}: AppointmentDetailModalProps) {
  const [openFlow, setOpenFlow] = useState<OpenFlow>(null);
  const now = useNow();

  if (!appointment) return null;

  const service = findAppointmentService(services, appointment);
  const customer = findAppointmentCustomer(customers, appointment);
  const employee = findAppointmentEmployee(members, appointment);
  const startsAt = new Date(appointment.startsAt);
  const isOverdue =
    appointment.status === "CONFIRMED" && now !== null && startsAt.getTime() < now;
  const closeFlow = () => setOpenFlow(null);
  const handleTransitionSuccess = (updated: Appointment) => {
    onUpdate(updated);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment details</DialogTitle>
            <DialogDescription>
              Review this appointment or change its status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {isOverdue && (
              <Alert className="border-primary/30 bg-primary/5 text-primary">
                <AlertTriangle className="size-4 text-primary" />
                <AlertTitle className="font-semibold text-primary">
                  Appointment overdue
                </AlertTitle>
                <AlertDescription className="text-primary/90">
                  This was scheduled to start at {formatTimeInTimeZone(startsAt, timeZone)} and the client
                  has not arrived yet.
                </AlertDescription>
              </Alert>
            )}

            <AppointmentDetailSummary
              title={appointment.title}
              serviceName={service?.name ?? "Unknown"}
              statusLabel={getAppointmentStatusLabel(appointment.status)}
              statusClassName={getAppointmentStatusClasses(appointment.status)}
            />

            <AppointmentDetailInfo
              formattedTime={formatAppointmentTime(appointment.startsAt, appointment.endsAt, timeZone)}
              formattedDate={formatAppointmentDate(appointment.startsAt, timeZone)}
              customerName={customer?.name ?? "Unknown"}
              employeeName={employee?.name ?? "Unknown"}
              cancellationReason={appointment.cancellationReason}
              isCancelled={appointment.status === "CANCELLED"}
            />
          </div>

          <DialogFooter>
            <AppointmentDetailActions
              status={appointment.status}
              onReschedule={() => setOpenFlow("reschedule")}
              onCancel={() => setOpenFlow("cancel")}
              onStart={() => setOpenFlow("start")}
              onComplete={() => setOpenFlow("complete")}
              onMarkNoShow={() => setOpenFlow("no-show")}
              canUpdateAppointment={canUpdateAppointment}
              canDeleteAppointment={canDeleteAppointment}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            onOpenChange(false);
          }}
          timeZone={timeZone}
        />
      )}

      {openFlow === "cancel" && (
        <CancelConfirmDialog
          isOpen
          onOpenChange={closeFlow}
          appointmentId={appointment.id}
          onSuccess={onUpdate}
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
