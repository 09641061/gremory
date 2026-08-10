import { createSchedulingAccessPolicyService } from "@/contexts/scheduling/application/internal/queryservices/scheduling-access-policy.service";
import { loadSchedulingPageData } from "@/contexts/scheduling/application/internal/queryservices/scheduling-page-data.query.service";
import { CreateAppointmentForm } from "@/contexts/scheduling/interfaces/components/appointment-form/create-appointment-form";
import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";

interface NewAppointmentPageProps {
  searchParams: Promise<{ organizationId?: string; establishmentId?: string }>;
}

export default async function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);

  const policyService = createSchedulingAccessPolicyService();
  const establishmentId = query.establishmentId ?? workspace.activeEstablishmentId;

  const { canCreateAppointment } = await policyService.getPermissions(establishmentId);

  if (!canCreateAppointment || !establishmentId) {
    redirect("/access-denied");
  }

  const { services, members, customers } = await loadSchedulingPageData(establishmentId);

  return (
    <CreateAppointmentForm
      establishmentId={establishmentId}
      services={services}
      members={members}
      customers={customers}
    />
  );
}
