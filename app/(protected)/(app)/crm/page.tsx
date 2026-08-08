import { getCrmPageData } from "@/contexts/crm/application/internal/queryservices/crm-page-data.service";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/customer-directory/crm-client-wrapper";
import { redirect } from "next/navigation";

interface CrmPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    size?: string;
    establishmentId?: string;
  }>;
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = params.page ? parseInt(params.page, 10) : 0;
  const size = params.size ? parseInt(params.size, 10) : 20;

  const { establishmentId, permissions, customersPage, searchFailed } = await getCrmPageData(
    params.establishmentId,
    search,
    page,
    size
  );

  if (!permissions.canReadCustomers) {
    redirect("/?denied=crm");
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
