import "server-only";

import { SchedulingApiGateway } from "@/contexts/scheduling/infrastructure/gateways/scheduling-api.gateway";
import type { SchedulingCustomerViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingCustomers(
  establishmentId: string,
  organizationId: string,
): Promise<SchedulingCustomerViewModel[]> {
  try {
    const gateway = new SchedulingApiGateway(organizationId);
    const customers = await gateway.getSchedulingCustomers(establishmentId);
    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
    }));
  } catch (error) {
    console.error("Failed to load customers for scheduler:", error);
    return [];
  }
}
