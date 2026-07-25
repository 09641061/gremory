import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationsPage } from "@/contexts/business/interfaces/components/organization/organizations-page";

export default async function OrganizationsRoutePage() {
  const organization =
    await createOrganizationQueryService().getMyOrganization();

  return <OrganizationsPage organization={organization} />;
}
