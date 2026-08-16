import { PencilLine, Store } from "lucide-react";
import type { EstablishmentListItem } from "./establishments-page";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { StatusBadge } from "@/contexts/shared/interfaces/components/ui/status-badge";

interface EstablishmentListCardProps {
  establishments: EstablishmentListItem[];
  filteredEstablishments: EstablishmentListItem[];
  selectedEstId: string | null;
  canUpdateMap?: Record<string, boolean>;
  defaultCanUpdate?: boolean;
  onSelect: (id: string) => void;
}

export function EstablishmentListCard({
  establishments,
  filteredEstablishments,
  selectedEstId,
  canUpdateMap = {},
  defaultCanUpdate = true,
  onSelect,
}: EstablishmentListCardProps) {
  return (
    <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
          <span>Establishments — {establishments.length}</span>
        </div>

        <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
          {filteredEstablishments.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted-foreground">
              No establishments found.
            </div>
          ) : (
            filteredEstablishments.map((est) => {
              const selected = est.id === selectedEstId;
              const canUpdate = canUpdateMap[est.id] ?? defaultCanUpdate;
              return (
                <button
                  key={est.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(est.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-border px-5 py-4 text-left transition-colors outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 ${
                    selected ? "bg-accent/60" : ""
                  }`}
                >
                  <Avatar>
                    {est.photoUrl ? (
                      <AvatarImage src={est.photoUrl} alt={est.name} />
                    ) : (
                      <AvatarFallback>
                        <Store className="size-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {est.name}
                    </p>
                    {canUpdate ? (
                      <StatusBadge tone="success">
                        <PencilLine className="size-3" />
                        Editable
                      </StatusBadge>
                    ) : null}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
