import "server-only";

import { createCrmQueryService } from "./crm-query.service";
import { createCrmAccessPolicyService, CrmPermissions } from "./crm-access-policy.service";
import { PageResponse } from "../../services/crm-query.service";
import { CustomerResponse } from "../../../domain/model/entities/customer";

const EMPTY_PAGE: PageResponse<CustomerResponse> = {
  content: [],
  pageable: { pageNumber: 0, pageSize: 20 },
  totalPages: 0,
  totalElements: 0,
  last: true,
};

export interface CrmPageData {
  establishmentId?: string;
  permissions: CrmPermissions;
  customersPage: PageResponse<CustomerResponse>;
  searchFailed: boolean;
}

export async function getCrmPageData(
  requestedEstablishmentId: string | undefined,
  organizationId: string | undefined,
  search: string,
  page: number,
  size: number,
  providedPermissions?: CrmPermissions,
): Promise<CrmPageData> {
  const policyService = createCrmAccessPolicyService();
  const establishmentId = requestedEstablishmentId;

  const permissions = providedPermissions ?? await policyService.getPermissions(establishmentId);

  if (!establishmentId || !permissions.canReadCustomers) {
    return { establishmentId, permissions, customersPage: EMPTY_PAGE, searchFailed: false };
  }

  try {
    const queryService = createCrmQueryService(organizationId);
    const customersPage = await queryService.search(establishmentId, search, page, size);
    return { establishmentId, permissions, customersPage, searchFailed: false };
  } catch (error) {
    console.error("Failed to fetch CRM customers:", error);
    return { establishmentId, permissions, customersPage: EMPTY_PAGE, searchFailed: true };
  }
}
