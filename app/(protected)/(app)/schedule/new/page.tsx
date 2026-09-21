import { Suspense } from "react";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { loadComposedSchedulingPageData } from "@/contexts/scheduling/interfaces/server/scheduling-composition";
import { CreateAppointmentForm } from "@/contexts/scheduling/interfaces/components/appointment-form/create-appointment-form";
import { redirect } from "next/navigation";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/feedback/page-loading";

interface NewAppointmentPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewAppointmentPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function NewAppointmentPageContent({ searchParams }: NewAppointmentPageProps) {
  const query = await searchParams;
  const business = composeBusinessAdapters();
  const workspace = await business.workspaceQueryService.getHeaderViewModel(query);
  if (workspace.accessPolicy?.canOpenScheduling !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;
  const workspaceEstablishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canCreateAppointment = hasEstablishmentPermission(workspaceEstablishment, "scheduling:manage");

  if (!canCreateAppointment || !establishmentId || !workspace.organization) {
    redirect("/access-denied");
  }

  const { services, members, customers } = await loadComposedSchedulingPageData(
    establishmentId,
    workspace.organization.id,
    canCreateAppointment,
  );
  const establishment = await business.establishmentQueryService.getById({ id: establishmentId });
  const timeZone = establishment?.timeZone ?? "UTC";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <CreateAppointmentForm
        establishmentId={establishmentId}
        services={services}
        members={members}
        customers={customers}
        timeZone={timeZone}
      />
    </main>
  );
}
