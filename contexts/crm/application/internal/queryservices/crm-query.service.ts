import { CrmQueryService, PageResponse } from "../../services/crm-query.service";
import { CustomerResponse } from "../../../domain/model/entities/customer";

export class CrmQueryServiceImpl implements CrmQueryService {
  constructor(private readonly gateway: CrmQueryService) {}

  search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number,
  ): Promise<PageResponse<CustomerResponse>> {
    return this.gateway.search(establishmentId, search, page, size);
  }

  getCustomer(id: string, establishmentId: string): Promise<CustomerResponse> {
    return this.gateway.getCustomer(id, establishmentId);
  }
}

export function createCrmQueryService(gateway: CrmQueryService): CrmQueryService {
  return new CrmQueryServiceImpl(gateway);
}
