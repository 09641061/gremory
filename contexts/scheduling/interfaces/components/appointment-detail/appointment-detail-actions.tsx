"use client";

import { CalendarClock, Ban, Check, Play, UserX } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface AppointmentDetailActionsProps {
  status: string;
  onReschedule: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onStart: () => void;
  onMarkNoShow: () => void;
  canUpdateAppointment: boolean;
  canDeleteAppointment: boolean;
}

export function AppointmentDetailActions({
  status,
  onReschedule,
  onCancel,
  onComplete,
  onStart,
  onMarkNoShow,
  canUpdateAppointment,
  canDeleteAppointment,
}: AppointmentDetailActionsProps) {
  const isConfirmed = status === "CONFIRMED";
  const isInProgress = status === "IN_PROGRESS";
  const isActive = isConfirmed || isInProgress;

  const canEdit = canUpdateAppointment && isConfirmed;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canEdit && (
        <Button type="button" size="sm" className="gap-1" onClick={onStart}>
          <Play className="size-4" />
          Start
        </Button>
      )}
      {canEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onMarkNoShow}
        >
          <UserX className="size-4" />
          No show
        </Button>
      )}
      {canUpdateAppointment && isInProgress && (
        <Button type="button" size="sm" className="gap-1" onClick={onComplete}>
          <Check className="size-4" />
          Complete
        </Button>
      )}
      {canEdit && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onReschedule}
        >
          <CalendarClock className="size-4" />
          Reschedule
        </Button>
      )}
      {canDeleteAppointment && isActive && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="gap-1"
          onClick={onCancel}
        >
          <Ban className="size-4" />
          Cancel
        </Button>
      )}
    </div>
  );
}
