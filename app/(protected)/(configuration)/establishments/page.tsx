import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { redirect } from "next/navigation";

export default async function EstablishmentsRoutePage() {
  let organizationId = "";
  let isOwner = true;
  const canUpdateMap: Record<string, boolean> = {};

  try {
    const organization = await createOrganizationQueryService().getMyOrganization();
    organizationId = organization.id;
  } catch {
    isOwner = false;
  }

  if (isOwner) {
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId,
      page: 0,
      size: 100,
    });

    page.content.forEach((est) => {
      canUpdateMap[est.id] = true;
    });

    return <EstablishmentsPage establishments={page.content} canUpdateMap={canUpdateMap} defaultCanUpdate={true} />;
  } else {
    try {
      const access = await createTeamQueryService().getAccessContext();
      if (access.establishments.length === 0) {
        redirect("/chat");
      }

      const allowedEstablishments = access.establishments.map((item) => {
        const canUpdate = item.effectivePermissions.some(
          (perm) =>
            perm === "business:establishments:manage" ||
            perm === "business:establishments:update" ||
            perm === "business:manage"
        );
        canUpdateMap[item.establishmentId] = canUpdate;

        return {
          id: item.establishmentId,
          name: item.establishmentName,
          photoUrl: null,
        };
      });

      return <EstablishmentsPage establishments={allowedEstablishments} canUpdateMap={canUpdateMap} defaultCanUpdate={false} />;
    } catch {
      redirect("/chat");
    }
  }
}
