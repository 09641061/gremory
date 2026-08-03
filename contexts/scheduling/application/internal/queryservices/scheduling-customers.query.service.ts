import "server-only";

import { CrmApiGateway } from "@/contexts/crm/infrastructure/gateways/crm-api.gateway";
import type { SchedulingCustomerViewModel } from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingCustomers(
  establishmentId: string
): Promise<SchedulingCustomerViewModel[]> {
  try {
    const crmApiGateway = new CrmApiGateway();
    const customersPage = await crmApiGateway.search(establishmentId, undefined, 0, 100);

    return customersPage.content.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    }));
  } catch (error) {
    console.error("Failed to load customers for scheduler:", error);
    return [];
  }
}
