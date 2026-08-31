"use client";

import { useState } from "react";
import { Store } from "lucide-react";
import type { EstablishmentListItem } from "./establishments-page";
import { updateEstablishmentAction } from "@/contexts/business/interfaces/actions/establishment.actions";
import { EntityProfileCard } from "@/contexts/business/interfaces/components/entity-profile-card/entity-profile-card";
import { TimeZoneField } from "../time-zone-field";
import { cn } from "@/lib/utils";

interface EstablishmentDetailCardProps {
  establishment: EstablishmentListItem | null;
  canUpdate?: boolean;
  onCancel?: () => void;
  className?: string;
}

export function EstablishmentDetailCard({
  establishment,
  canUpdate = true,
  onCancel,
  className,
}: EstablishmentDetailCardProps) {
  const [timeZone, setTimeZone] = useState(establishment?.timeZone ?? "America/Lima");
  const [prevEstablishmentId, setPrevEstablishmentId] = useState(establishment?.id ?? null);

  if ((establishment?.id ?? null) !== prevEstablishmentId) {
    setPrevEstablishmentId(establishment?.id ?? null);
    setTimeZone(establishment?.timeZone ?? "America/Lima");
  }

  if (!establishment) {
    return (
      <div className={cn("flex-1", className)}>
        <div className="flex min-h-(--app-page-viewport-height) items-center justify-center rounded-xl border border-border bg-card p-8 text-center shadow-sm lg:ml-3">
          <div className="max-w-xs">
            <Store className="mx-auto size-10 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium text-foreground">Select an establishment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose an establishment to view its details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("hidden flex-1 lg:block", className)}>
      <EntityProfileCard
        key={establishment.id}
        entityLabel="Establishment"
        photoNoun="photo"
        icon={Store}
        entityId={establishment.id}
        entityName={establishment.name}
        photoUrl={establishment.photoUrl}
        updateAction={updateEstablishmentAction}
        canUpdate={canUpdate}
        onCancel={onCancel}
        className="lg:ml-3 lg:h-(--app-page-viewport-height)"
        extraFields={
          <div className="flex flex-col border-t border-border">
            <div className="space-y-4 p-6">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Time zone</h3>
                <p className="text-sm text-muted-foreground">
                  Used for scheduling and analytics in local time.
                </p>
              </div>
              <div className="max-w-xs">
                <TimeZoneField
                  name="timeZone"
                  value={timeZone}
                  onChange={setTimeZone}
                  disabled={!canUpdate}
                />
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
