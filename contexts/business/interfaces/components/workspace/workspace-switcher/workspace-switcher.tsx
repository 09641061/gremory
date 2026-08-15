"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, SearchIcon } from "lucide-react";

import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/contexts/shared/interfaces/components/ui/input-group";
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
  const [organizationQuery, setOrganizationQuery] = useState("");

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

  const filteredOtherOrganizations = useMemo(
    () =>
      otherOrganizations.filter((org) =>
        org.name.toLowerCase().includes(organizationQuery.trim().toLowerCase()),
      ),
    [otherOrganizations, organizationQuery],
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
                  // The gear icon reads as "edit this", so it must track real update
                  // rights - `canUpdate` is already true for the owner and for a
                  // member granted `business:manage` on this organization. Using
                  // read access alone was the bug: a member browsing its host
                  // organization commonly has read but that is not an invitation to
                  // edit it. `canRead` still gates whether /organization is reachable
                  // at all.
                  //
                  // The establishment id must travel with the link too: without it,
                  // `/organization` resolves the workspace with no active context and
                  // the server defaults an owner back to its own organization, so
                  // editing the host organization would silently open this account's
                  // own instead.
                  href={
                    organization.canRead && organization.canUpdate
                      ? buildWorkspacePath("/organization", searchParams.toString(), selectedEstablishmentId)
                      : undefined
                  }
                  onNavigate={close}
                />
                {otherOrganizations.length > 0 && (
                  <div className="flex flex-col border-t border-border/60 mt-1 pt-1.5">
                    <InputGroup className="h-8 border-input/30 bg-input/30 shadow-none has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0 mb-2">
                      <InputGroupAddon align="inline-start">
                        <SearchIcon className="pointer-events-none" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder="Find organization..."
                        value={organizationQuery}
                        onChange={(event) => setOrganizationQuery(event.target.value)}
                      />
                    </InputGroup>
                    <div className="no-scrollbar max-h-48 space-y-1 overflow-y-auto overscroll-contain">
                      {filteredOtherOrganizations.length === 0 ? (
                        <p className="w-full py-2 text-center text-sm text-muted-foreground">
                          No organizations found
                        </p>
                      ) : (
                        filteredOtherOrganizations.map((org) => (
                          <button
                            key={org.id}
                            type="button"
                            onClick={() => {
                              close();
                              // "OWNER" only applies when switching back into the
                              // organization this account actually owns - never to a
                              // foreign one just because the account happens to hold
                              // Owner status somewhere else right now. Everywhere
                              // else, the target establishment's own permissions
                              // decide where this lands.
                              const targetAccountType =
                                workspace.ownedOrganizationId === org.id ? "OWNER" : "MEMBER";
                              globalThis.location.assign(
                                buildWorkspacePath(
                                  resolveEstablishmentEntryPath(
                                    targetAccountType,
                                    org.firstEstablishment,
                                    pathname,
                                  ),
                                  searchParams.toString(),
                                  org.firstEstablishment.id,
                                ),
                              );
                            }}
                            className="relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm text-left outline-hidden select-none hover:bg-muted hover:text-foreground transition-colors"
                          >
                            <span className="truncate flex-1">{org.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        close();
                        router.push(
                          buildWorkspacePath("/organizations", searchParams.toString(), selectedEstablishmentId),
                        );
                      }}
                      className="h-8 w-full justify-start px-2 text-sm font-normal text-muted-foreground"
                    >
                      All Organizations
                    </Button>
                  </div>
                )}
                {/* Offered only while the account owns no organization yet - once
                    it does, this same button would try to create a second one and
                    the backend would reject it as a duplicate. */}
                {accountType === "MEMBER" && !workspace.ownedOrganizationId && (
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
