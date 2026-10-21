"use client";

import * as React from "react";
import type { CustomerOverviewViewModel } from "@/contexts/crm/application/models/customer";
import { useCrmTranslations } from "@/contexts/crm/interfaces/i18n";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/contexts/shared/interfaces/components/ui/card";

export interface CrmCustomerHistoryCardProps {
  overview: CustomerOverviewViewModel | null;
}

export function CrmCustomerHistoryCard({ overview }: CrmCustomerHistoryCardProps) {
  const t = useCrmTranslations();

  const recentAppointments = overview?.appointments.recentAppointments ?? [];

  return (
    <Card className="border">
      <CardHeader className="py-3 px-4 border-b bg-muted/20">
        <CardTitle className="text-sm font-medium">{t.masterDetail.historyTitle}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {recentAppointments.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            {t.masterDetail.noAppointmentsHistory}
          </div>
        ) : (
          <div className="divide-y text-sm">
            {recentAppointments.map((app) => (
              <div key={app.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{app.serviceName}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(app.startsAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {app.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
