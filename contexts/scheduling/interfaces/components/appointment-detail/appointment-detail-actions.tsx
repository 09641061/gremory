"use client";

import { CalendarClock, Ban, Check, Play, UserX } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

import { useSchedulingTranslations } from "../../i18n";

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
  const { t } = useSchedulingTranslations();
  const isConfirmed = status === "CONFIRMED";
  const isInProgress = status === "IN_PROGRESS";
  const isActive = isConfirmed || isInProgress;

  const canEdit = canUpdateAppointment && isConfirmed;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {canEdit && (
        <Button type="button" size="sm" className="gap-1" onClick={onStart}>
          <Play className="size-4" />
          {t.appointmentDetail.start}
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
          {t.appointmentDetail.noShow}
        </Button>
      )}
      {canUpdateAppointment && isInProgress && (
        <Button type="button" size="sm" className="gap-1" onClick={onComplete}>
          <Check className="size-4" />
          {t.appointmentDetail.complete}
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
          {t.appointmentDetail.reschedule}
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
          {t.appointmentDetail.cancel}
        </Button>
      )}
    </div>
  );
}
