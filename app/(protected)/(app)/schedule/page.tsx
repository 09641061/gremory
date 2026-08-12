import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { WeeklyCalendar } from "@/contexts/scheduling/interfaces/components/calendar/weekly-calendar";
import { redirect } from "next/navigation";

interface SchedulePageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const { establishmentId: paramEstId } = await searchParams;

  const policyService = createSchedulingAccessPolicyService();
  const defaultEstId = await policyService.getDefaultEstablishmentId();
  const establishmentId = paramEstId ?? defaultEstId ?? undefined;

  if (!establishmentId) {
    redirect("/?error=no-establishment");
  }

  const {
    canReadAppointments,
    canCreateAppointment,
    canUpdateAppointment,
    canDeleteAppointment,
  } = await policyService.getPermissions(establishmentId);

  if (!canReadAppointments) {
    redirect(`/?denied=scheduling`);
  }

  const establishment = await createEstablishmentQueryService().getById({ id: establishmentId });
  const timeZone = establishment?.timeZone ?? "UTC";
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
        timeZone={timeZone}
      />
    </main>
  );
}
