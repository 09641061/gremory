import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { createEstablishmentQueryService } from "@/contexts/business/application/internal/queryservices/establishment-query.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { CreateAppointmentForm } from "@/contexts/scheduling/interfaces/components/appointment-form/create-appointment-form";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface NewAppointmentPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const policyService = createSchedulingAccessPolicyService();
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  const { canCreateAppointment } = await policyService.getPermissions(establishmentId);

  if (!canCreateAppointment || !establishmentId || !workspace.organization) {
    redirect("/access-denied");
  }

  const { services, members, customers } = await loadSchedulingPageData(
    establishmentId,
    workspace.organization.id,
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
