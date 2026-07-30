import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function OrganizationsRoutePage() {
  let organization;
  let canUpdate = true;
  let canRead = true;

  try {
    organization = await createOrganizationQueryService().getMyOrganization();
  } catch {
    canUpdate = false;
    try {
      const access = await createTeamQueryService().getAccessContext();
      const firstEstablishment = access.establishments[0];
      if (firstEstablishment) {
        canRead = access.establishments.some(
          (item) =>
            item.organizationId === firstEstablishment.organizationId &&
            item.effectivePermissions.some(
              (perm) =>
                perm === "business:organizations:read" ||
                perm === "business:organizations:manage" ||
                perm === "business:manage"
            )
        );

        if (canRead) {
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
      } else {
        canRead = false;
      }
    } catch {
      canRead = false;
    }
  }

  if (!canRead) {
    const headersList = await headers();
    const referer = headersList.get("referer");
    let redirectUrl = "/chat";
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        redirectUrl = refererUrl.pathname;
      } catch {}
    }
    redirect(`${redirectUrl}?denied=org`);
  }

  if (!organization) {
    redirect("/chat");
  }

  return <OrganizationsPageView organization={organization} canUpdate={canUpdate} />;
}
