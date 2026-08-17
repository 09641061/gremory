import { getCrmPageData } from "@/contexts/crm/application/internal/queryservices/crm-page-data.service";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/customer-directory/crm-client-wrapper";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface CrmPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    size?: string;
    organizationId?: string;
    establishmentId?: string;
  }>;
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = params.page ? parseInt(params.page, 10) : 0;
  const size = params.size ? parseInt(params.size, 10) : 20;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(params);

  const { establishmentId, permissions, customersPage, searchFailed } = await getCrmPageData(
    params.establishmentId ?? workspace.activeEstablishmentId,
    workspace.organization?.id,
    search,
    page,
    size
  );

  if (!permissions.canReadCustomers) {
    redirect("/access-denied");
  }

  return (
    <CrmClientWrapper
      initialCustomers={customersPage}
      establishmentId={establishmentId}
      canCreateCustomer={permissions.canCreateCustomer}
      canUpdateCustomer={permissions.canUpdateCustomer}
      canDeleteCustomer={permissions.canDeleteCustomer}
      loadError={searchFailed}
    />
  );
}
