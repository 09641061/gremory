"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, Store } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import {
  buildWorkspacePath,
  resolveEstablishmentEntryPath,
} from "@/contexts/business/domain/services/workspace-navigation.policy";

/**
 * Sidebar header control: the organization the account belongs to and the
 * establishment it is currently working on, in one trigger.
 *
 * They are one control and not two because the organization is fixed for the
 * account: there is nothing to switch to, so it reads as the caption of the
 * establishment rather than as a second selector. Its settings screen is
 * reachable from inside the menu, where it does not compete with the switch.
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
      triggerClassName="h-(--app-sidebar-profile-height) w-full justify-start gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) border border-border/60 bg-card px-(--app-sidebar-control-padding-x) font-medium"
      footer={
        workspace.canReadOrganization ? (
          <Link
            href="/organization"
            className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm font-normal text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Building2 className="size-4" />
            Organization settings
          </Link>
        ) : undefined
      }
    >
      <Avatar className="size-(--app-sidebar-avatar-size) shrink-0 border border-border/60 bg-muted">
        {activeEstablishment?.photoUrl ? (
          <AvatarImage src={activeEstablishment.photoUrl} alt="" />
        ) : (
          <AvatarFallback className="bg-muted">
            <Store className="size-3.5 text-muted-foreground" />
          </AvatarFallback>
        )}
      </Avatar>

      <span className="flex min-w-0 flex-1 flex-col items-start text-left leading-tight">
        <span className="w-full truncate text-[0.7rem] font-normal text-muted-foreground">
          {organization?.name ?? "Organization"}
        </span>
        <span className="w-full truncate text-sm font-medium">
          {activeEstablishment?.name ?? "Select establishment"}
        </span>
      </span>
    </SearchableOptions>
  );
}
