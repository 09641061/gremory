import { Store } from "lucide-react";
import type { EstablishmentListItem } from "./establishments-page";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

interface EstablishmentListCardProps {
  establishments: EstablishmentListItem[];
  filteredEstablishments: EstablishmentListItem[];
  selectedEstId: string | null;
  onSelect: (id: string) => void;
}

export function EstablishmentListCard({
  establishments,
  filteredEstablishments,
  selectedEstId,
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
              return (
                <div
                  key={est.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => onSelect(est.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(est.id);
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 ${
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
                  <p className="truncate text-[15px] font-medium text-foreground">
                    {est.name}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
