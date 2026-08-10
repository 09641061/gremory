import { Building2 } from "lucide-react";
import type { WorkspaceHeaderOrganization } from "@/contexts/business/application/model/business-workspace.view-models";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";

interface OrganizationListCardProps {
  organizations: ReadonlyArray<WorkspaceHeaderOrganization>;
  filteredOrganizations: ReadonlyArray<WorkspaceHeaderOrganization>;
  selectedOrgId: string | null;
  onSelect: (id: string) => void;
}

export function OrganizationListCard({
  organizations,
  filteredOrganizations,
  selectedOrgId,
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
              const selected = org.id === selectedOrgId;
              return (
                <div
                  key={org.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  onClick={() => onSelect(org.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(org.id);
                    }
                  }}
                  className={`flex cursor-pointer items-center gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 ${
                    selected ? "bg-accent/60" : ""
                  }`}
                >
                  <Avatar>
                    {org.imageUrl ? (
                      <AvatarImage src={org.imageUrl} alt={org.name} />
                    ) : (
                      <AvatarFallback>
                        <Building2 className="size-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p className="truncate text-[15px] font-medium text-foreground">
                    {org.name}
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
