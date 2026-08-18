"use client";

import { Building2 } from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import { Card, CardContent } from "@/contexts/shared/interfaces/components/ui/card";
import type { OrganizationListItem } from "./organizations-page";

interface OrganizationListCardProps {
  organizations: ReadonlyArray<OrganizationListItem>;
  filteredOrganizations: ReadonlyArray<OrganizationListItem>;
  previewOrgId: string | null;
  previewOrganization: OrganizationListItem | null;
  activeOrganizationId: string | null;
  ownedOrganizationId: string | null;
  onPreview: (id: string) => void;
  onConfirm: (id: string) => void;
}

export function OrganizationListCard({
  organizations,
  filteredOrganizations,
  previewOrgId,
  previewOrganization,
  activeOrganizationId,
  ownedOrganizationId,
  onPreview,
  onConfirm,
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
            <div className="flex flex-col items-center gap-3 px-5 py-12 text-center text-sm text-muted-foreground">
              <Building2 className="size-8" aria-hidden="true" />
              <span>No organizations found.</span>
            </div>
          ) : (
            filteredOrganizations.map((org) => {
              const previewing = org.organizationId === previewOrgId;
              const active = org.organizationId === activeOrganizationId;
              return (
                <button
                  key={org.organizationId}
                  type="button"
                  aria-pressed={previewing}
                  onClick={() => onPreview(org.organizationId)}
                  className={`flex w-full cursor-pointer items-center gap-3 border-b border-border px-5 py-4 text-left transition-colors outline-none last:border-b-0 hover:bg-muted/40 focus-visible:bg-muted/40 ${
                    previewing ? "bg-accent/60 ring-1 ring-inset ring-ring/20" : ""
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
                      {org.establishments.length === 0
                        ? "No accessible establishments"
                        : `${org.establishments.length} establishment${
                            org.establishments.length === 1 ? "" : "s"
                          }`}
                    </p>
                  </div>
                  <div className="ml-auto flex shrink-0 flex-col items-end gap-1">
                    {org.organizationId === ownedOrganizationId && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        Yours
                      </span>
                    )}
                    {active && (
                      <span className="rounded-full border border-ring/20 bg-background px-2 py-0.5 text-xs text-foreground">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {previewOrganization ? (
          <div className="border-t border-border p-3">
            <button
              type="button"
              onClick={() => onConfirm(previewOrganization.organizationId)}
              className={buttonVariants({ variant: "default" })}
            >
              Work in {previewOrganization.organizationName}
            </button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
