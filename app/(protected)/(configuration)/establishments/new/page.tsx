import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { redirect } from "next/navigation";

interface NewEstablishmentPageProps {
  searchParams: Promise<{ establishmentId?: string }>;
}

export default async function NewEstablishmentPage({ searchParams }: NewEstablishmentPageProps) {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(await searchParams);

  // An account without an organization is either mid-invitation or mid onboarding
  // step 1 (owner hasn't created an organization yet).
  if (!workspace.organization) {
    redirect(
      workspace.accountType === "PENDING_INVITATION" ? "/invitations/pending" : "/organizations/new",
    );
  }

  if (!workspace.canCreateEstablishment) {
    redirect("/access-denied");
  }

  return <CreateEstablishmentForm organizationId={workspace.organization.id} />;
}
