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
import { RescheduleFormModal } from "../appointment-form/reschedule-form-modal";
import { AppointmentDetailActions } from "./appointment-detail-actions";
import { AppointmentDetailInfo } from "./appointment-detail-info";
import { AppointmentDetailSummary } from "./appointment-detail-summary";
import {
  findAppointmentCustomer,
  findAppointmentEmployee,
  findAppointmentService,
  formatAppointmentDate,
  formatAppointmentTime,
  getAppointmentStatusClasses,
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
}: AppointmentDetailModalProps) {
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  if (!appointment) return null;

  const service = findAppointmentService(services, appointment);
  const customer = findAppointmentCustomer(customers, appointment);
  const employee = findAppointmentEmployee(members, appointment);
  const formattedDate = formatAppointmentDate(appointment.startsAt);
  const formattedTime = formatAppointmentTime(appointment.startsAt, appointment.endsAt);
  const isCancelled = appointment.status === "CANCELLED";
  const statusLabel = appointment.status.toLowerCase();

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
              isCancelled={isCancelled}
              onReschedule={() => setIsRescheduleOpen(true)}
              onCancel={() => setIsCancelOpen(true)}
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
    </>
  );
}
