import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { WeeklyCalendar } from "@/contexts/scheduling/interfaces/components/calendar/weekly-calendar";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface SchedulePageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const policyService = createSchedulingAccessPolicyService();
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  if (!establishmentId) {
    redirect("/establishments/new");
  }

  const {
    canReadAppointments,
    canCreateAppointment,
    canUpdateAppointment,
    canDeleteAppointment,
  } = await policyService.getPermissions(establishmentId);

  if (!canReadAppointments) {
    redirect("/access-denied");
  }

  const { services, members, customers } = await loadSchedulingPageData(establishmentId);

  return (
    <main className="p-6">
      <WeeklyCalendar
        establishmentId={establishmentId}
        services={services}
        members={members}
        customers={customers}
        canCreateAppointment={canCreateAppointment}
        canUpdateAppointment={canUpdateAppointment}
        canDeleteAppointment={canDeleteAppointment}
      />
    </main>
  );
}
