import "server-only";

import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { CrmApiGateway } from "@/contexts/crm/infrastructure/gateways/crm-api.gateway";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import type {
  SchedulingCustomerViewModel,
  SchedulingMemberViewModel,
  SchedulingPageData,
  SchedulingServiceViewModel,
} from "../../model/scheduling-page-data.view-model";

export async function loadSchedulingPageData(establishmentId: string): Promise<SchedulingPageData> {
  const services = await loadServices(establishmentId);
  const members = await loadMembers(establishmentId);
  const customers = await loadCustomers(establishmentId);

  return { services, members, customers };
}

async function loadServices(establishmentId: string): Promise<SchedulingServiceViewModel[]> {
  try {
    const serviceQueryService = createCatalogServiceQueryService();
    const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });
    return servicesPage.content.map((service) => ({
      id: service.id,
      name: service.name,
      price: service.price,
      durationMinutes: service.durationMinutes,
    }));
  } catch (error) {
    console.error("Failed to load services for scheduler:", error);
    return [];
  }
}

async function loadMembers(establishmentId: string): Promise<SchedulingMemberViewModel[]> {
  try {
    const teamQueryService = createTeamQueryService();
    const membersPage = await teamQueryService.list({ establishmentId, size: 100 });
    return membersPage.content.map((user) => ({
      id: user.memberId ?? "",
      userId: user.userId ?? "",
      name: user.email.split("@")[0] || "Employee",
      email: user.email,
      role: user.roleName,
      status: user.status,
    }));
  } catch (error) {
    console.error("Failed to load team members for scheduler:", error);
    return [];
  }
}

async function loadCustomers(establishmentId: string): Promise<SchedulingCustomerViewModel[]> {
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
