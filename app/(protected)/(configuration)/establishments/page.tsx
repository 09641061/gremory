import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function EstablishmentsRoutePage() {
  let organizationId = "";
  let isOwner = true;
  let canRead = true;
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
    let allowedEstablishments: { id: string; name: string; photoUrl: string | null }[] = [];
    try {
      const access = await createTeamQueryService().getAccessContext();
      if (access.establishments.length === 0) {
        canRead = false;
      }

      allowedEstablishments = access.establishments
        .filter((item) =>
          item.effectivePermissions.some(
            (perm) =>
              perm === "business:establishments:read" ||
              perm === "business:establishments:manage" ||
              perm === "business:manage"
          )
        )
        .map((item) => {
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

      if (allowedEstablishments.length === 0) {
        canRead = false;
      }
    } catch {
      canRead = false;
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
      redirect(`${redirectUrl}?denied=est`);
    }

    return <EstablishmentsPage establishments={allowedEstablishments} canUpdateMap={canUpdateMap} defaultCanUpdate={false} />;
  }
}
