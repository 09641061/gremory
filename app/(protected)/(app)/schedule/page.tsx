import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { createCatalogServiceQueryService } from "@/contexts/catalog/application/internal/queryservices/catalog-service-query.service";
import { createTeamQueryService } from "@/contexts/workforce/application/internal/queryservices/team-query.service";
import { CrmApiGateway } from "@/contexts/crm/infrastructure/gateways/crm-api.gateway";
import { WeeklyCalendar } from "@/contexts/scheduling/interfaces/components/weekly-calendar";
import { redirect } from "next/navigation";
import { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { MemberResponse } from "@/contexts/scheduling/interfaces/models/member-response";
import { CustomerResponse } from "@/contexts/crm/domain/model/entities/customer";

interface SchedulePageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const policyService = createCatalogAccessPolicyService();
  const defaultEstId = await policyService.getDefaultEstablishmentId();
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  if (!establishmentId) {
    redirect("/chat?error=no-establishment");
  }

  // Load related metadata server-side to populate selectors and modal details
  let services: DetailedServiceDTO[] = [];
  let members: MemberResponse[] = [];
  let customers: CustomerResponse[] = [];

  try {
    const serviceQueryService = createCatalogServiceQueryService();
    const servicesPage = await serviceQueryService.search({ establishmentId, page: 0, size: 100 });
    services = servicesPage.content;
  } catch (error) {
    console.error("Failed to load services for scheduler:", error);
  }

  try {
    const teamQueryService = createTeamQueryService();
    const membersPage = await teamQueryService.list({ establishmentId, size: 100 });
    members = membersPage.content.map((user) => ({
      id: user.memberId ?? "",
      userId: user.userId ?? "",
      name: user.email.split("@")[0] || "Employee", // fallback formatting
      email: user.email,
      role: user.roleName,
      status: user.status,
    }));
  } catch (error) {
    console.error("Failed to load team members for scheduler:", error);
  }

  try {
    const crmApiGateway = new CrmApiGateway();
    const customersPage = await crmApiGateway.search(establishmentId, undefined, 0, 100);
    customers = customersPage.content.map((c) => ({
      id: c.id,
      organizationId: c.organizationId,
      establishmentId: c.establishmentId,
      documentType: c.documentType,
      documentNumber: c.documentNumber,
      name: c.name,
      phone: c.phone,
      email: c.email,
      taxpayerStatus: c.taxpayerStatus,
      taxpayerCondition: c.taxpayerCondition,
    }));
  } catch (error) {
    console.error("Failed to load customers for scheduler:", error);
  }

  return (
    <main className="p-6">
      <WeeklyCalendar
        establishmentId={establishmentId}
        services={services}
        members={members}
        customers={customers}
      />
    </main>
  );
}
