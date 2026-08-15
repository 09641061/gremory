import { Building2 } from "lucide-react";
import type { OrganizationListItem } from "./organizations-page";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

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
    <Card className="overflow-hidden rounded-xl border-border bg-card shadow-sm lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
      <CardContent className="p-0 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-border px-5 py-4 text-sm font-medium text-muted-foreground shrink-0">
          <span>Organizations — {organizations.length}</span>
        </div>

        <div className="scrollbar-hide lg:flex-1 lg:overflow-y-auto lg:min-h-0">
          {filteredOrganizations.length === 0 ? (
            <div className="px-5 py-10 text-sm text-muted-foreground">
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
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-border px-5 py-4 text-left transition-colors outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 ${
                    selected ? "bg-accent/60" : ""
                  }`}
                >
                  <Avatar>
                    {org.organizationImageUrl ? (
                      <AvatarImage src={org.organizationImageUrl} alt={org.organizationName} />
                    ) : (
                      <AvatarFallback>
                        <Building2 className="size-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="truncate text-sm font-medium text-foreground">
                    {org.organizationName}
                  </p>
                  {org.organizationId === ownedOrganizationId && (
                    <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Yours
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
