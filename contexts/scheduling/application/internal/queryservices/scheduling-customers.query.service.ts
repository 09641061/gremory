import type { SchedulingRosterReader } from "../../ports/scheduling-roster";
import type { SchedulingCustomerViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingCustomers(
  reader: SchedulingRosterReader,
  establishmentId: string,
  token?: string,
): Promise<SchedulingCustomerViewModel[]> {
  const customers = await reader.getSchedulingCustomers(establishmentId, undefined, token);
  return customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
  }));
}
