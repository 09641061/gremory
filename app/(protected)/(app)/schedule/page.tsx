import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { DailyStaffCalendar } from "@/contexts/scheduling/interfaces/components/calendar/daily-staff-calendar";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";

interface SchedulePageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  if (!establishmentId) {
    redirect("/establishments/new");
  }

  // Module entry is controlled by the workspace contract. Appointment-level
  // permissions below only decide which mutations the calendar exposes.
  if (workspace.accessPolicy?.canOpenScheduling !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canManageScheduling = hasEstablishmentPermission(establishment, "scheduling:manage");
  const canCreateAppointment = canManageScheduling;
  const canUpdateAppointment = canManageScheduling;
  const canDeleteAppointment = canManageScheduling;

  const establishmentDetails = await createEstablishmentQueryService().getById({ id: establishmentId });
  const timeZone = establishmentDetails?.timeZone ?? "UTC";
  const { services, members, customers } = await loadSchedulingPageData(establishmentId);

  return (
    <main className="p-6">
      <DailyStaffCalendar
        key={`${establishmentId}-${timeZone}`}
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
