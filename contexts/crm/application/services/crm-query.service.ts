import { CustomerResponse } from "../../domain/model/entities/customer";

export interface PageResponse<T> {
  content: T[];
  pageable: { pageNumber: number; pageSize: number };
  totalPages: number;
  totalElements: number;
  last: boolean;
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
