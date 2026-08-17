import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import type { WorkspaceNavigationOrganizationGroup } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { groupEstablishmentsByOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { workspaceSelectionCookies } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";

interface OrganizationsRoutePageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string; previewOrganizationId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsRoutePageProps) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const requestedOrganizationId = query.organizationId;
  const requestedPreviewOrganizationId = query.previewOrganizationId;
  const rememberedPreviewOrganizationId =
    cookieStore.get(workspaceSelectionCookies.previewOrganizationId)?.value ?? null;
  const activeOrganizationId = cookieStore.get(workspaceSelectionCookies.organizationId)?.value ?? workspace.organization?.id ?? null;
  const ownedOrganization = workspace.ownedOrganizationId
    ? await createOrganizationQueryService().getById({ id: workspace.ownedOrganizationId }).catch(() => null)
    : null;

  // An account without an organization has an invitation to accept first.
  if (workspace.accountType === "PENDING_INVITATION") {
    redirect("/invitations/pending");
  }

  // Already scoped by the workforce ACL: every establishment here is one the
  // account genuinely has access to, grouped by the organization it belongs to.
  const organizations = groupEstablishmentsByOrganization(
    workspace.establishments,
    workspace.organization?.id,
    workspace.organization?.name,
    workspace.organization?.imageUrl,
  ).map((organization) =>
    organization.organizationId === workspace.organization?.id
      ? { ...organization, canUpdate: workspace.organization.canUpdate === true }
      : organization,
  );

  const organizationsWithOwnedOrganization = appendOrganizationGroup(
    appendOrganizationGroup(
      organizations,
      workspace.organization
        ? {
            organizationId: workspace.organization.id,
            organizationName: workspace.organization.name,
            organizationImageUrl: workspace.organization.imageUrl ?? null,
            establishments: [],
            canUpdate: workspace.organization.canUpdate === true,
          }
        : null,
    ),
    ownedOrganization
      ? {
          organizationId: ownedOrganization.id,
          organizationName: ownedOrganization.name,
          organizationImageUrl: ownedOrganization.imageUrl,
          establishments: [],
          canUpdate: workspace.ownedOrganizationId === ownedOrganization.id
            ? workspace.organization?.id === ownedOrganization.id
              ? workspace.organization.canUpdate === true
              : undefined
            : undefined,
        }
      : null,
  );

  return (
    <OrganizationsPage
      organizations={organizationsWithOwnedOrganization}
      ownedOrganizationId={workspace.ownedOrganizationId}
      initialPreviewOrganizationId={
        requestedPreviewOrganizationId ?? requestedOrganizationId ?? rememberedPreviewOrganizationId ?? activeOrganizationId
      }
      activeOrganizationId={activeOrganizationId}
    />
  );
}

function appendOrganizationGroup(
  organizations: ReadonlyArray<WorkspaceNavigationOrganizationGroup>,
  organization: WorkspaceNavigationOrganizationGroup | null,
) {
  if (!organization) return organizations;
  if (organizations.some((item) => item.organizationId === organization.organizationId)) {
    return organizations;
  }
  return [...organizations, organization];
}
