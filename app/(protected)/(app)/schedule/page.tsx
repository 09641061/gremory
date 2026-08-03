import { createCatalogAccessPolicyService } from "@/contexts/catalog/application/internal/queryservices/catalog-access-policy.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { WeeklyCalendar } from "@/contexts/scheduling/interfaces/components/calendar/weekly-calendar";
import { redirect } from "next/navigation";

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

  const { services, members, customers } = await loadSchedulingPageData(establishmentId);

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
