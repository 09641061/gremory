import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { EstablishmentsPage } from "@/contexts/business/interfaces/components/bussines/establishments-page";

export default async function EstablishmentsRoutePage() {
  let establishments: { id: string; name: string; photoUrl: string | null }[] = [];

  try {
    const organization = await createOrganizationQueryService().getMyOrganization();
    const page = await createEstablishmentQueryService().getByOrganization({
      organizationId: organization.props.id.value,
      page: 0,
      size: 100,
    });
    establishments = page.content.map((establishment) => ({
      id: establishment.props.id.value,
      name: establishment.props.name.value,
      photoUrl: establishment.props.photoUrl.value,
    }));
  } catch {
    // The protected layout remains available when the Business API is unavailable.
  }

  return <EstablishmentsPage establishments={establishments} />;
}
