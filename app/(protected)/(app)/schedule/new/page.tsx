import { Suspense } from "react";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { CreateAppointmentForm } from "@/contexts/scheduling/interfaces/components/appointment-form/create-appointment-form";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { resolveModuleAccessFallback } from "@/contexts/shared/application/services/module-access.policy";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

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
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  if (workspace.accessPolicy?.canOpenScheduling !== true) {
    redirect(resolveModuleAccessFallback(workspace));
  }

  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;
  const workspaceEstablishment = getWorkspaceEstablishment(workspace, establishmentId);
  const canCreateAppointment = hasEstablishmentPermission(workspaceEstablishment, "scheduling:manage");

  if (!canCreateAppointment || !establishmentId || !workspace.organization) {
    redirect("/access-denied");
  }

  const { services, members, customers } = await loadSchedulingPageData(
    establishmentId,
    workspace.organization.id,
    canCreateAppointment,
  );
  const establishment = await createEstablishmentQueryService().getById({ id: establishmentId });
  const timeZone = establishment?.timeZone ?? "UTC";

  return (
    <main className="mx-auto w-full max-w-[800px] px-4 py-8">
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
