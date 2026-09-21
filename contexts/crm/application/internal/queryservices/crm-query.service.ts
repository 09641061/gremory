import type { CrmQueryPort } from "../../ports/crm-query.port";
import type { CustomerPageViewModel, CustomerViewModel } from "../../models/customer";

export class CrmQueryServiceImpl implements CrmQueryPort {
  constructor(private readonly gateway: CrmQueryPort) {}
  search(establishmentId: string, search?: string, page?: number, size?: number): Promise<CustomerPageViewModel> {
    return this.gateway.search(establishmentId, search, page, size);
  }
  getCustomer(id: string, establishmentId: string): Promise<CustomerViewModel> {
    return this.gateway.getCustomer(id, establishmentId);
  }
}
export function createCrmQueryService(gateway: CrmQueryPort): CrmQueryPort { return new CrmQueryServiceImpl(gateway); }
