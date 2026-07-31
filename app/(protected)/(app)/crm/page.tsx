import { createCrmQueryService } from "@/contexts/crm/application/internal/queryservices/crm-query.service";
import { createCrmAccessPolicyService } from "@/contexts/crm/application/internal/queryservices/crm-access-policy.service";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/crm-client-wrapper";
import { PageResponse } from "@/contexts/crm/application/services/crm-query.service";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
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

  const policyService = createCrmAccessPolicyService();
  const defaultEstId = await policyService.getDefaultEstablishmentId();
  const establishmentId = params.establishmentId ?? defaultEstId;

  const { canReadCustomers, canCreateCustomer, canUpdateCustomer, canDeleteCustomer } =
    await policyService.getPermissions(establishmentId);

  if (!canReadCustomers) {
    redirect("/chat?denied=crm");
  }

  let customersPage: PageResponse<CustomerResponse> = {
    content: [],
    pageable: { pageNumber: 0, pageSize: 20 },
    totalPages: 0,
    totalElements: 0,
    last: true,
  };

  if (establishmentId) {
    try {
      const queryService = createCrmQueryService();
      customersPage = await queryService.search(establishmentId, search, page, size);
    } catch (error) {
      console.error("Failed to fetch CRM customers:", error);
    }
  }

  return (
    <CrmClientWrapper
      initialCustomers={customersPage}
      establishmentId={establishmentId || ""}
      canCreateCustomer={canCreateCustomer}
      canUpdateCustomer={canUpdateCustomer}
      canDeleteCustomer={canDeleteCustomer}
    />
  );
}
