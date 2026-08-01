"use client";

import { CalendarCheck, Clock, User, UserCheck, Tag, CalendarClock, Ban } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/contexts/shared/interfaces/components/ui/dialog";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Appointment } from "../../domain/model/entities/appointment";
import { useState } from "react";
import { CancelConfirmDialog } from "./cancel-confirm-dialog";
import { RescheduleFormModal } from "./reschedule-form-modal";
import { MemberResponse } from "../models/member-response";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  services: DetailedServiceDTO[];
  members: MemberResponse[];
  customers: CustomerResponse[];
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

  const service = services.find((s) => s.id === appointment.serviceId);
  const customer = customers.find((c) => c.id === appointment.customerId);
  const employee = members.find((m) => m.userId === appointment.employeeId);

  const starts = new Date(appointment.startsAt);
  const ends = new Date(appointment.endsAt);

  const formattedDate = starts.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${starts.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${ends.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CalendarCheck className="text-primary size-5" />
              <DialogTitle>Appointment Details</DialogTitle>
            </div>
            <DialogDescription>
              View detailed information of this appointment or make modifications.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold leading-tight text-foreground">{appointment.title}</h3>
                <div className="text-sm text-muted-foreground flex items-center justify-between gap-1.5 mt-2 bg-muted/20 p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-1.5">
                    <Tag className="size-3.5 text-muted-foreground" />
                    <span>Service: <span className="font-medium text-foreground">{service?.name ?? "Unknown"}</span></span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                appointment.status === "CANCELLED"
                  ? "border-destructive/20 bg-destructive/10 text-destructive"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}>
                {appointment.status.toLowerCase()}
              </span>
            </div>

            <div className="border-t border-border pt-4 grid grid-cols-1 gap-4">
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground size-5 shrink-0 mt-0.5" />
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">{formattedTime}</p>
                    <p className="text-xs text-muted-foreground">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-border/50 pt-3">
                <User className="text-muted-foreground size-5 shrink-0 mt-0.5" />
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="text-sm font-medium text-foreground">{customer?.name ?? "Unknown"}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-border/50 pt-3">
                <UserCheck className="text-muted-foreground size-5 shrink-0 mt-0.5" />
                <div className="flex-1 flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Assigned Employee</p>
                    <p className="text-sm font-medium text-foreground">{employee?.name ?? "Unknown"}</p>
                  </div>
                </div>
              </div>

              {appointment.status === "CANCELLED" && appointment.cancellationReason && (
                <div className="flex items-start gap-3 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <Ban className="text-destructive size-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Cancellation Reason</p>
                    <p className="text-xs text-foreground mt-0.5">{appointment.cancellationReason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <div className="flex gap-2 w-full justify-end">
              {appointment.status !== "CANCELLED" && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => setIsRescheduleOpen(true)}
                  >
                    <CalendarClock className="size-4" />
                    Reschedule
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-1"
                    onClick={() => setIsCancelOpen(true)}
                  >
                    <Ban className="size-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
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
