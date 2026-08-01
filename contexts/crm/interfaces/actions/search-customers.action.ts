"use server";

import { CrmApiGateway } from "../../infrastructure/gateways/crm-api.gateway";
import { CustomerResponse } from "../../domain/model/entities/customer";
import { PageResponse } from "../../application/services/crm-query.service";

export async function searchCustomersAction(
  establishmentId: string,
  search?: string,
  page = 0,
  size = 50
): Promise<PageResponse<CustomerResponse>> {
  try {
    const gateway = new CrmApiGateway();
    return await gateway.search(establishmentId, search, page, size);
  } catch (error) {
    console.error("Search customers action failed:", error);
    return {
      content: [],
      pageable: { pageNumber: 0, pageSize: size },
      totalPages: 0,
      totalElements: 0,
      last: true,
    };
  }
}
