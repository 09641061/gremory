"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingServiceViewModel,
} from "../../../application/model/scheduling-page-data.view-model";
import type { Appointment } from "../../../domain/model/entities/appointment";
import { CancelConfirmDialog } from "../confirm-dialogs/cancel-confirm-dialog";
import { StartConfirmDialog } from "../confirm-dialogs/start-confirm-dialog";
import { CompleteConfirmDialog } from "../confirm-dialogs/complete-confirm-dialog";
import { NoShowConfirmDialog } from "../confirm-dialogs/no-show-confirm-dialog";
import { RescheduleFormModal } from "../appointment-form/reschedule-form-modal";
import { AppointmentDetailActions } from "./appointment-detail-actions";
import { AppointmentDetailInfo } from "./appointment-detail-info";
import { AppointmentDetailSummary } from "./appointment-detail-summary";
import { Alert, AlertDescription, AlertTitle } from "@/contexts/shared/interfaces/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import {
  findAppointmentCustomer,
  findAppointmentEmployee,
  findAppointmentService,
  formatAppointmentDate,
  formatAppointmentTime,
  getAppointmentStatusClasses,
  getAppointmentStatusLabel,
} from "./appointment-detail-utils";

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
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);

  if (!appointment) return null;

  const handleStart = () => {
    setIsStartOpen(true);
  };

  const handleComplete = () => {
    setIsCompleteOpen(true);
  };

  const handleMarkNoShow = () => {
    setIsNoShowOpen(true);
  };

  const service = findAppointmentService(services, appointment);
  const customer = findAppointmentCustomer(customers, appointment);
  const employee = findAppointmentEmployee(members, appointment);
  const formattedDate = formatAppointmentDate(appointment.startsAt, timeZone);
  const formattedTime = formatAppointmentTime(appointment.startsAt, appointment.endsAt, timeZone);
  const isCancelled = appointment.status === "CANCELLED";
  const statusLabel = getAppointmentStatusLabel(appointment.status);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              View detailed information of this appointment or make modifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {appointment.status === "CONFIRMED" && new Date(appointment.startsAt) < new Date() && (
              <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/5 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">Appointment overdue</AlertTitle>
                <AlertDescription className="text-amber-700/90 dark:text-amber-300/90">
                  This appointment was scheduled to start at {formattedTime.split(" - ")[0]}. The client has not arrived yet.
                </AlertDescription>
              </Alert>
            )}

            <AppointmentDetailSummary
              title={appointment.title}
              serviceName={service?.name ?? "Unknown"}
              statusLabel={statusLabel}
              statusClassName={getAppointmentStatusClasses(appointment.status)}
            />

            <AppointmentDetailInfo
              formattedTime={formattedTime}
              formattedDate={formattedDate}
              customerName={customer?.name ?? "Unknown"}
              employeeName={employee?.name ?? "Unknown"}
              cancellationReason={appointment.cancellationReason}
              isCancelled={isCancelled}
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <AppointmentDetailActions
              status={appointment.status}
              onReschedule={() => setIsRescheduleOpen(true)}
              onCancel={() => setIsCancelOpen(true)}
              onComplete={handleComplete}
              onStart={handleStart}
              onMarkNoShow={handleMarkNoShow}
              canUpdateAppointment={canUpdateAppointment}
              canDeleteAppointment={canDeleteAppointment}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isRescheduleOpen && (
        <RescheduleFormModal
          isOpen={isRescheduleOpen}
          onOpenChange={setIsRescheduleOpen}
          appointment={appointment}
          services={services}
          members={members}
          customers={customers}
          onSuccess={(updated) => {
            onUpdate(updated);
            onOpenChange(false);
          }}
          onDeleteSuccess={() => {
            onDeleteSuccess();
            onOpenChange(false);
          }}
          timeZone={timeZone}
        />
      )}

      {isCancelOpen && (
        <CancelConfirmDialog
          isOpen={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          appointmentId={appointment.id}
          onSuccess={onUpdate}
        />
      )}

      {isStartOpen && (
        <StartConfirmDialog
          isOpen={isStartOpen}
          onOpenChange={setIsStartOpen}
          appointmentId={appointment.id}
          onSuccess={(updated) => {
            onUpdate(updated);
            onOpenChange(false);
          }}
        />
      )}

      {isCompleteOpen && (
        <CompleteConfirmDialog
          isOpen={isCompleteOpen}
          onOpenChange={setIsCompleteOpen}
          appointmentId={appointment.id}
          onSuccess={(updated) => {
            onUpdate(updated);
            onOpenChange(false);
          }}
        />
      )}

      {isNoShowOpen && (
        <NoShowConfirmDialog
          isOpen={isNoShowOpen}
          onOpenChange={setIsNoShowOpen}
          appointmentId={appointment.id}
          onSuccess={(updated) => {
            onUpdate(updated);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
