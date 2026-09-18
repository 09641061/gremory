"use client";

import { PencilLine, Store, Trash2 } from "lucide-react";
import type { EstablishmentListItem } from "./establishments-page";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";
import { EntityListRow } from "@/contexts/shared/interfaces/components/entity-list-row";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

interface EstablishmentListCardProps {
  establishments: EstablishmentListItem[];
  filteredEstablishments: EstablishmentListItem[];
  selectedEstId: string | null;
  canUpdateMap?: Record<string, boolean>;
  canDeleteMap?: Record<string, boolean>;
  defaultCanUpdate?: boolean;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function EstablishmentListCard({
  establishments,
  filteredEstablishments,
  selectedEstId,
  canUpdateMap = {},
  canDeleteMap = {},
  defaultCanUpdate = true,
  onSelect,
  onDelete,
}: EstablishmentListCardProps) {
  const { t } = useBusinessTranslations();

  return (
    <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
          <span>{t.establishments.count.replace("{count}", String(establishments.length))}</span>
        </div>

        <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
          {filteredEstablishments.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center text-sm text-muted-foreground">
              <Store className="size-8" aria-hidden="true" />
              <span>{t.establishments.noEstablishmentsFound}</span>
            </div>
          ) : (
            filteredEstablishments.map((est) => {
              const selected = est.id === selectedEstId;
              const canUpdate = canUpdateMap[est.id] ?? defaultCanUpdate;
              const canDelete = canDeleteMap[est.id] ?? false;
              return (
                <EntityListRow
                  key={est.id}
                  avatarSrc={est.photoUrl}
                  avatarFallbackIcon={<Store className="size-4" />}
                  name={est.name}
                  selected={selected}
                  onSelect={() => onSelect(est.id)}
                  badges={
                    canUpdate ? (
                      <StatusBadge tone="success">
                        <PencilLine className="size-3" />
                        {t.establishments.editable}
                      </StatusBadge>
                    ) : null
                  }
                  actions={
                    canDelete
                      ? [
                          {
                            label: t.entityCard.delete,
                            icon: Trash2,
                            variant: "destructive",
                            onSelect: () => onDelete?.(est.id),
                          },
                        ]
                      : undefined
                  }
                  actionsLabel={t.entityCard.actionsFor.replace("{name}", est.name)}
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
