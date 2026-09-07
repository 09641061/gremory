import { CustomerResponse } from "../../domain/model/entities/customer";

export interface PageResponse<T> {
  content: T[];
  // Spring's `VIA_DTO` page serialization uses `PagedModel`, which flattens
  // pagination into top-level scalar fields rather than a `pageable` object.
  pageable?: { pageNumber?: number; pageSize?: number };
  page?: { size?: number; number?: number; totalElements?: number; totalPages?: number };
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  first?: boolean;
}

export interface CrmQueryService {
  search(
    establishmentId: string,
    search?: string,
    page?: number,
    size?: number
  ): Promise<PageResponse<CustomerResponse>>;

  getCustomer(id: string, establishmentId: string): Promise<CustomerResponse>;
}
