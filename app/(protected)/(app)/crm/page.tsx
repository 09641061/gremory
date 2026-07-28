import { createBusinessEstablishmentAclService } from "@/contexts/business/application/internal/outboundservices/business-establishment-acl.service";
import { createCrmQueryService } from "@/contexts/crm/application/internal/queryservices/crm-query.service";
import { CrmClientWrapper } from "@/contexts/crm/interfaces/components/crm-client-wrapper";
import { PageResponse } from "@/contexts/crm/application/services/crm-query.service";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";

interface CrmPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    size?: string;
  }>;
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const page = params.page ? parseInt(params.page, 10) : 0;
  const size = params.size ? parseInt(params.size, 10) : 20;

  const aclService = createBusinessEstablishmentAclService();
  const establishmentId = await aclService.getActiveEstablishmentIdForUser();

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
    />
  );
}
