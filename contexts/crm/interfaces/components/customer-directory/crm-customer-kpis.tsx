"use client";

import * as React from "react";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import type { CustomerOverviewViewModel } from "@/contexts/crm/application/models/customer";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";

export interface CrmCustomerKpisProps {
  overview: CustomerOverviewViewModel | null;
  loadingOverview: boolean;
}

export function CrmCustomerKpis({ overview, loadingOverview }: CrmCustomerKpisProps) {
  const t = useCrmTranslations();

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return t.masterDetail.noAppointments;
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="p-4 border bg-card/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Calendar className="size-4" />
          {t.masterDetail.kpiTotalAppointments}
        </div>
        <div className="text-2xl font-bold mt-2">
          {loadingOverview ? "-" : (overview?.appointments.totalAppointments ?? 0)}
        </div>
      </Card>

      <Card className="p-4 border bg-card/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <Clock className="size-4" />
          {t.masterDetail.kpiLastOrNextVisit}
        </div>
        <div className="text-sm font-semibold mt-2 truncate">
          {loadingOverview ? "-" : formatDate(overview?.appointments.lastOrNextVisitAt)}
        </div>
      </Card>

      <Card className="p-4 border bg-card/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <AlertCircle className="size-4 text-amber-500" />
          {t.masterDetail.kpiNoShows}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-2xl font-bold">
            {loadingOverview ? "-" : (overview?.appointments.noShowCount ?? 0)}
          </span>
          {(overview?.appointments.noShowCount ?? 0) > 0 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-normal">
              {t.masterDetail.noShowsAlert}
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
}
