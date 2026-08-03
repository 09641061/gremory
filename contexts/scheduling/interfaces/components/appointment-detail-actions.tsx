"use client";

import { CalendarClock, Ban } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

interface AppointmentDetailActionsProps {
  isCancelled: boolean;
  onReschedule: () => void;
  onCancel: () => void;
}

export function AppointmentDetailActions({
  isCancelled,
  onReschedule,
  onCancel,
}: AppointmentDetailActionsProps) {
  return (
    <div className="flex gap-2 w-full justify-end">
      {!isCancelled && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={onReschedule}>
            <CalendarClock className="size-4" />
            Reschedule
          </Button>
          <Button type="button" variant="destructive" size="sm" className="gap-1" onClick={onCancel}>
            <Ban className="size-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
