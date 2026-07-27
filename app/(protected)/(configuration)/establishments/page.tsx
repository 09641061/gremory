import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { EstablishmentsPage } from "@/contexts/business/interfaces/components/establishment/establishments-page/establishments-page";

export default async function EstablishmentsRoutePage() {
  const organization = await createOrganizationQueryService().getMyOrganization();
  const page = await createEstablishmentQueryService().getByOrganization({
    organizationId: organization.id,
    page: 0,
    size: 100,
  });

  return <EstablishmentsPage establishments={page.content} />;
}
