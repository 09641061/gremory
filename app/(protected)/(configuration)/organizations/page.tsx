import { redirect } from "next/navigation";
import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { groupEstablishmentsByOrganization } from "@/contexts/business/domain/services/workspace-navigation.policy";

interface OrganizationsRoutePageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function OrganizationsRoutePage({ searchParams }: OrganizationsRoutePageProps) {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(await searchParams);

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
  );

  return (
    <OrganizationsPage
      organizations={organizations}
      ownedOrganizationId={workspace.ownedOrganizationId}
    />
  );
}
