import { Suspense } from "react";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { loadComposedSchedulingPageData } from "@/contexts/scheduling/interfaces/server/scheduling-composition";
import { DailyStaffCalendar } from "@/contexts/scheduling/interfaces/components/calendar/daily-staff-calendar";
import { redirect } from "next/navigation";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";

interface SchedulePageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default function SchedulePage({ searchParams }: SchedulePageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <SchedulePageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SchedulePageContent({ searchParams }: SchedulePageProps) {
  const query = await searchParams;
  const business = composeBusinessAdapters();
  const workspace = await business.workspaceQueryService.getHeaderViewModel(query);

  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  if (!establishmentId) {
    redirect("/establishments/new");
  }
  if (!workspace.organization) {
    redirect("/access-denied");
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

  const establishmentDetails = await business.establishmentQueryService.getById({ id: establishmentId });
  const timeZone = establishmentDetails?.timeZone ?? "UTC";
  const { services, members, customers } = await loadComposedSchedulingPageData(
    establishmentId,
    workspace.organization.id,
    canManageScheduling,
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 lg:px-8 lg:py-6">
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
