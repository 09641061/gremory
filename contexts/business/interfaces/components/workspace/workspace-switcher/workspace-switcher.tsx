"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
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

  return (
    <SearchableOptions
      options={establishments}
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
        organization ? (
          <OrganizationBadge
            organization={organization}
            // Clicking the organization opens its settings, where the name and
            // the logo are changed.
            href={workspace.canReadOrganization ? "/organization" : undefined}
          />
        ) : undefined
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
