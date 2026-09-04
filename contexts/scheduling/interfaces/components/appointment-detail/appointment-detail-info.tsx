"use client";

import { Ban, Clock, User, UserCheck } from "lucide-react";

interface AppointmentDetailInfoProps {
  formattedTime: string;
  formattedDate: string;
  customerName: string;
  employeeName: string;
  cancellationReason?: string | null;
  isCancelled: boolean;
}

import { useSchedulingTranslations } from "../../i18n";

export function AppointmentDetailInfo({
  formattedTime,
  formattedDate,
  customerName,
  employeeName,
  cancellationReason,
  isCancelled,
}: AppointmentDetailInfoProps) {
  const { t } = useSchedulingTranslations();

  return (
    <div className="border-t border-border pt-4 grid grid-cols-1 gap-4">
      <div className="flex items-start gap-3">
        <Clock className="text-muted-foreground size-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{formattedTime}</p>
          <p className="text-xs text-muted-foreground">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-border/50 pt-3">
        <User className="text-muted-foreground size-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{t.appointmentDetail.customer}</p>
          <p className="text-sm font-medium text-foreground">{customerName}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-border/50 pt-3">
        <UserCheck className="text-muted-foreground size-5 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{t.appointmentDetail.assignedEmployee}</p>
          <p className="text-sm font-medium text-foreground">{employeeName}</p>
        </div>
      </div>

      {isCancelled && cancellationReason && (
        <div className="flex items-start gap-3 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
          <Ban className="text-destructive size-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">{t.appointmentDetail.cancellationReason}</p>
            <p className="text-xs text-foreground mt-0.5">{cancellationReason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
