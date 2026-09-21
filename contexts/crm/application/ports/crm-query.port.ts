import type { CustomerPageViewModel, CustomerViewModel } from "../models/customer";

export interface CrmQueryPort {
  search(establishmentId: string, search?: string, page?: number, size?: number): Promise<CustomerPageViewModel>;
  getCustomer(id: string, establishmentId: string): Promise<CustomerViewModel>;
}
