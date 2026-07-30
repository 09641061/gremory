import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { redirect } from "next/navigation";

export default async function OrganizationsRoutePage() {
  let organization;
  let canUpdate = true;

  try {
    organization = await createOrganizationQueryService().getMyOrganization();
  } catch (error) {
    canUpdate = false;
    try {
      const access = await createTeamQueryService().getAccessContext();
      const firstEstablishment = access.establishments[0];
      if (firstEstablishment) {
        organization = await createOrganizationQueryService().getById({
          id: firstEstablishment.organizationId,
        });

        canUpdate = access.establishments.some(
          (item) =>
            item.organizationId === firstEstablishment.organizationId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "business:organizations:update" ||
                perm === "business:organizations:manage" ||
                perm === "business:manage"
            )
        );
      }
    } catch {
      // Ignore and fallback
    }
  }

  if (!organization) {
    redirect("/chat");
  }

  return <OrganizationsPageView organization={organization} canUpdate={canUpdate} />;
}
