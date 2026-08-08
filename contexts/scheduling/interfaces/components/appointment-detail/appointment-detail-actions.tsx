"use client";

import { CalendarClock, Ban, Check } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface AppointmentDetailActionsProps {
  status: string;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
}

export function AppointmentDetailActions({
  status,
  onReschedule,
  onCancel,
  onComplete,
  canUpdateAppointment,
  canDeleteAppointment,
}: AppointmentDetailActionsProps) {
  const isEditable = status === "CONFIRMED";
  const isActive = status === "CONFIRMED" || status === "IN_PROGRESS";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div className="flex gap-2 w-full justify-end">
      <div className="flex gap-2">
        {isInProgress && canUpdateAppointment && (
          <Button type="button" variant="default" size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onComplete}>
            <Check className="size-4" />
            Complete
          </Button>
        )}
        {isEditable && canUpdateAppointment && (
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onReschedule}>
            <CalendarClock className="size-4" />
            Reschedule
          </Button>
        )}
        {isActive && canDeleteAppointment && (
          <Button type="button" variant="destructive" size="sm" className="gap-1" onClick={onCancel}>
            <Ban className="size-4" />
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
