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
  const isActive = status === "CONFIRMED" || status === "IN_PROGRESS";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <div className="flex gap-2 w-full justify-end">
      <div className="flex gap-2">
        {isConfirmed && canUpdateAppointment && (
          <Button type="button" variant="default" size="sm" className="gap-1 bg-primary hover:bg-primary/95 text-primary-foreground" onClick={onStart}>
            <Play className="size-4" />
            Start
          </Button>
        )}
        {isConfirmed && canUpdateAppointment && (
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onMarkNoShow}>
            <UserX className="size-4" />
            No Show
          </Button>
        )}
        {isInProgress && canUpdateAppointment && (
          <Button type="button" variant="default" size="sm" className="gap-1" onClick={onComplete}>
            <Check className="size-4" />
            Complete
          </Button>
        )}
        {isConfirmed && canUpdateAppointment && (
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
