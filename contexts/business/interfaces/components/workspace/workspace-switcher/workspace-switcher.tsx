"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import {
  buildWorkspacePath,
  resolveEstablishmentEntryPath,
} from "@/contexts/business/domain/services/workspace-navigation.policy";
import { OrganizationBadge } from "@/contexts/business/interfaces/components/workspace/organization-badge/organization-badge";
import { WorkspaceAvatar } from "@/contexts/business/interfaces/components/workspace/workspace-avatar/workspace-avatar";

/**
 * The sidebar's single answer to "where am I working": the organization and the
 * establishment in one control.
 *
 * They are one control and not two stacked rows because they answer one
 * question. The hierarchy between them is carried by the composed avatar and by
 * type weight — organization as a muted caption, establishment as the subject —
 * so nothing has to be spelled out with a second border or a second row.
 */
export function WorkspaceSwitcher({
  workspace,
}: {
  workspace: WorkspaceHeaderViewModel;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { organization, establishments, accountType } = workspace;
  const requestedEstablishmentId = searchParams.get("establishmentId");
  const selectedEstablishmentId =
    requestedEstablishmentId &&
    establishments.some((establishment) => establishment.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId;
  const activeEstablishment = establishments.find(
    (establishment) => establishment.id === selectedEstablishmentId,
  );

  // Filter establishments to show only those of the active organization
  const currentOrgEstablishments = establishments.filter(
    (est) => !est.organizationId || est.organizationId === organization?.id,
  );

  // Group and list other organizations to allow switching
  const otherOrganizations = Array.from(
    new Map(
      establishments
        .filter((est) => est.organizationId && est.organizationId !== organization?.id)
        .map((est) => [
          est.organizationId,
          {
            id: est.organizationId!,
            name: est.organizationName!,
            firstEstablishment: est,
          },
        ]),
    ).values(),
  );

  return (
    <SearchableOptions
      options={currentOrgEstablishments}
      selectedId={selectedEstablishmentId}
      onSelect={(establishment) => {
        // A full load, not a client transition: switching establishment changes
        // the permissions every server component on the next screen reads.
        globalThis.location.assign(
          buildWorkspacePath(
            resolveEstablishmentEntryPath(accountType, establishment, pathname),
            searchParams.toString(),
            establishment.id,
          ),
        );
      }}
      onSelectAll={
        workspace.canReadEstablishments
          ? () =>
              router.push(
                buildWorkspacePath(
                  "/establishments",
                  searchParams.toString(),
                  selectedEstablishmentId,
                ),
              )
          : undefined
      }
      allLabel="All Establishments"
      searchPlaceholder="Find establishment..."
      emptyMessage="No establishments found"
      newLabel="New establishment"
      onNew={
        workspace.canCreateEstablishment
          ? () => router.push("/establishments/new")
          : undefined
      }
      header={
        organization
          ? (close) => (
              <div className="flex flex-col w-full">
                <OrganizationBadge
                  organization={organization}
                  // Clicking the organization opens its settings, where the name and
                  // the logo are changed.
                  href={workspace.canReadOrganization ? "/organization" : undefined}
                  onNavigate={close}
                />
                {otherOrganizations.length > 0 && (
                  <div className="flex flex-col gap-1 border-t border-border/60 mt-1 pt-1.5 px-2 pb-1">
                    <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                      Switch Organization
                    </span>
                    {otherOrganizations.map((org) => (
                      <button
                        key={org.id}
                        type="button"
                        onClick={() => {
                          close();
                          globalThis.location.assign(
                            buildWorkspacePath(
                              resolveEstablishmentEntryPath(accountType, org.firstEstablishment, pathname),
                              searchParams.toString(),
                              org.firstEstablishment.id,
                            ),
                          );
                        }}
                        className="flex items-center gap-2 w-full rounded-sm px-1.5 py-1 text-xs text-left text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors"
                      >
                        <span className="truncate flex-1">{org.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                {/* A member always sees the host organization here, never their own,
                    so this is the only door into starting their own business. */}
                {accountType === "MEMBER" && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      close();
                      router.push("/organizations/new");
                    }}
                    className="h-8 w-full justify-start gap-2 px-2 text-sm font-normal text-muted-foreground"
                  >
                    <Building2 className="size-4" />
                    Create your own business
                  </Button>
                )}
              </div>
            )
          : undefined
      }
      // The background stays put on hover and open: the organization logo is
      // punched out of it with a ring, so a shifting surface would leave a seam
      // around the badge. Feedback comes from the border and the text instead.
      triggerClassName="h-(--app-sidebar-profile-height) w-full justify-start gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) border border-border/60 bg-card px-(--app-sidebar-control-padding-x) font-medium transition-colors hover:border-ring/50 hover:bg-card aria-expanded:border-ring/50 aria-expanded:bg-card"
    >
      <WorkspaceAvatar
        establishmentPhotoUrl={activeEstablishment?.photoUrl}
        organizationImageUrl={organization?.imageUrl}
        hasOrganization={Boolean(organization)}
      />

      <span className="flex min-w-0 flex-1 flex-col items-start justify-center text-left leading-tight">
        {organization && (
          <span className="w-full truncate text-[0.7rem] font-normal text-muted-foreground">
            {organization.name}
          </span>
        )}
        <span className="w-full truncate text-sm font-medium">
          {activeEstablishment?.name ?? "Select establishment"}
        </span>
      </span>
    </SearchableOptions>
  );
}
