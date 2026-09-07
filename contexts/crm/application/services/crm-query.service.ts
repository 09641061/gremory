import { CustomerResponse } from "../../domain/model/entities/customer";
import type { PageResponse } from "@/contexts/shared/application/model/page-response";
export type { PageResponse } from "@/contexts/shared/application/model/page-response";

export interface CrmQueryService {
  search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number
  ): Promise<PageResponse<CustomerResponse>>;

  getCustomer(id: string, establishmentId: string): Promise<CustomerResponse>;
}
