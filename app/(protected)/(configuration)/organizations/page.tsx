import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { OrganizationsPageView } from "@/contexts/business/interfaces/components/organization/organizations-page/organizations-page-view";

export default async function OrganizationsRoutePage() {
  const organization =
    await createOrganizationQueryService().getMyOrganization();

  return <OrganizationsPageView organization={organization} />;
}
