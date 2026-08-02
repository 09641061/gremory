import "server-only";

import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";
import { CrmApiGateway } from "@/contexts/crm/infrastructure/gateways/crm-api.gateway";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { MemberResponse } from "@/contexts/scheduling/interfaces/models/member-response";

export type SchedulingPageData = Readonly<{
  services: DetailedServiceDTO[];
  members: MemberResponse[];
  customers: CustomerResponse[];
}>;

export async function loadSchedulingPageData(establishmentId: string): Promise<SchedulingPageData> {
  const services = await loadServices(establishmentId);
  const members = await loadMembers(establishmentId);
  const customers = await loadCustomers(establishmentId);

  return { services, members, customers };
}

async function loadServices(establishmentId: string): Promise<DetailedServiceDTO[]> {
  try {
    const serviceQueryService = createCatalogServiceQueryService();
    const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });
    return servicesPage.content;
  } catch (error) {
    console.error("Failed to load services for scheduler:", error);
    return [];
  }
}

async function loadMembers(establishmentId: string): Promise<MemberResponse[]> {
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

async function loadCustomers(establishmentId: string): Promise<CustomerResponse[]> {
  try {
    const crmApiGateway = new CrmApiGateway();
    const customersPage = await crmApiGateway.search(establishmentId, undefined, 0, 100);
    return customersPage.content.map((customer) => ({
      id: customer.id,
      organizationId: customer.organizationId,
      establishmentId: customer.establishmentId,
      documentType: customer.documentType,
      documentNumber: customer.documentNumber,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      taxpayerStatus: customer.taxpayerStatus,
      taxpayerCondition: customer.taxpayerCondition,
    }));
  } catch (error) {
    console.error("Failed to load customers for scheduler:", error);
    return [];
  }
}
