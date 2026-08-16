import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Badge } from "@/contexts/shared/interfaces/components/ui/badge";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import type { OrganizationListItem } from "./organizations-page";

interface OrganizationListCardProps {
  organizations: ReadonlyArray<OrganizationListItem>;
  filteredOrganizations: ReadonlyArray<OrganizationListItem>;
  selectedOrgId: string | null;
  ownedOrganizationId: string | null;
  onSelect: (id: string) => void;
}

export function OrganizationListCard({
  organizations,
  filteredOrganizations,
  selectedOrgId,
  ownedOrganizationId,
  onSelect,
}: OrganizationListCardProps) {
  return (
    <Card className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground shrink-0">
          <span>Organizations</span>
          <span>{organizations.length}</span>
        </div>

        <div className="scrollbar-hide lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {filteredOrganizations.length === 0 ? (
            <div className="px-5 py-12 text-sm text-muted-foreground">
              No organizations found.
            </div>
          ) : (
            filteredOrganizations.map((org) => {
              const selected = org.organizationId === selectedOrgId;
              return (
                <button
                  key={org.organizationId}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(org.organizationId)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-border/70 px-5 py-4 text-left transition-colors outline-none last:border-b-0 hover:bg-muted/20 focus-visible:bg-muted/20 ${
                    selected ? "bg-accent/30" : ""
                  }`}
                >
                  <Avatar className="size-10 shrink-0">
                    {org.organizationImageUrl ? (
                      <AvatarImage src={org.organizationImageUrl} alt={org.organizationName} />
                    ) : (
                      <AvatarFallback>
                        <Building2 className="size-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {org.organizationName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {org.establishments.length} {org.establishments.length === 1 ? "establishment" : "establishments"}
                    </p>
                  </div>
                  {org.organizationId === ownedOrganizationId ? (
                    <Badge variant="outline" className="rounded-full px-2.5 text-[0.7rem] font-medium uppercase tracking-wide">
                      Yours
                    </Badge>
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
