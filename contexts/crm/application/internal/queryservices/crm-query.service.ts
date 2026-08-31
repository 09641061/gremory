import "server-only";

import { CrmQueryService, PageResponse } from "../../services/crm-query.service";
import { CustomerResponse } from "../../../domain/model/entities/customer";
import { CrmApiGateway } from "../../../infrastructure/gateways/crm-api.gateway";

export class CrmQueryServiceImpl implements CrmQueryService {
  constructor(private readonly gateway: CrmQueryService) {}

  search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number
  ): Promise<PageResponse<CustomerResponse>> {
    return this.gateway.search(establishmentId, search, page, size);
  }

  getCustomer(id: string, establishmentId: string): Promise<CustomerResponse> {
    return this.gateway.getCustomer(id, establishmentId);
  }
}

export function createCrmQueryService(organizationId?: string): CrmQueryService {
  return new CrmQueryServiceImpl(new CrmApiGateway(organizationId));
}
