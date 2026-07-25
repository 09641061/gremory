import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/business/create-establishment-form";

export default async function NewEstablishmentPage() {
  const organization = await createOrganizationQueryService().getMyOrganization();

  return <CreateEstablishmentForm organizationId={organization.id} />;
}
