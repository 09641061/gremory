import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { OrganizationApiGateway } from "@/contexts/business/infrastructure/gateways/organization-api.gateway";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";

interface OrganizationsRoutePageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string; previewOrganizationId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsRoutePageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  // The organizations index must load the complete accessible workspace. The
  // query organization only selects the preview; sending it to `/workspace`
  // would scope the response to one organization and hide foreign memberships.
  const [workspace, accessibleOrganizations] = await Promise.all([
    createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId: query.establishmentId }),
    new OrganizationApiGateway().findAccessible(),
  ]);
  const requestedOrganizationId = query.organizationId;
  const requestedPreviewOrganizationId = query.previewOrganizationId;
  const rememberedPreviewOrganizationId =
    cookieStore.get(workspaceSelectionCookies.previewOrganizationId)?.value ?? null;
  const activeOrganizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? workspace.organization?.id ?? null;
  const ownedOrganizationId =
    accessibleOrganizations.find((organization) => organization.isOwned)?.id ??
    workspace.ownedOrganizationId;

  // An account without an organization has an invitation to accept first.
  if (workspace.accountType === "PENDING_INVITATION") {
    redirect("/invitations/pending");
  }

  const organizations: ReadonlyArray<WorkspaceNavigationOrganizationGroup> = accessibleOrganizations.map(
    (organization) => ({
      organizationId: organization.id,
      organizationName: organization.name,
      organizationImageUrl: organization.imageUrl,
      canUpdate: organization.permissions.canUpdate,
      canCreateEstablishment: organization.permissions.canCreateEstablishment,
      establishments: organization.establishments.map((establishment) => ({
        id: establishment.id,
        name: establishment.name,
        photoUrl: establishment.photoUrl ?? null,
        timeZone: establishment.timeZone ?? null,
        effectivePermissions: establishment.effectivePermissions,
        organizationId: organization.id,
        organizationName: organization.name,
        organizationImageUrl: organization.imageUrl,
      })),
    }),
  );

  return (
    <OrganizationsPage
      organizations={organizations}
      ownedOrganizationId={ownedOrganizationId ?? null}
      initialPreviewOrganizationId={
        requestedPreviewOrganizationId ?? requestedOrganizationId ?? rememberedPreviewOrganizationId ?? activeOrganizationId
      }
      activeOrganizationId={activeOrganizationId}
    />
  );
}
