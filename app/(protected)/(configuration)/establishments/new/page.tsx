import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { createOrganizationQueryService } from "@/contexts/business/application/internal/queryservices/organization-query.service";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { redirect } from "next/navigation";

interface NewEstablishmentPageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

export default async function NewEstablishmentPage({ searchParams }: NewEstablishmentPageProps) {
  const query = await searchParams;
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel(query);
  const requestedOrganizationId = query.organizationId;

  // An account without an organization is either mid-invitation or mid onboarding
  // step 1 (owner hasn't created an organization yet).
  if (!workspace.organization) {
    redirect(
      workspace.accountType === "PENDING_INVITATION" ? "/invitations/pending" : "/organizations/new",
    );
  }

  const organization =
    requestedOrganizationId && requestedOrganizationId !== workspace.organization.id
      ? workspace.ownedOrganizationId === requestedOrganizationId
        ? await createOrganizationQueryService().getById({ id: requestedOrganizationId })
        : null
      : workspace.organization;

  if (!organization) {
    redirect("/access-denied");
  }

  const organizationEstablishmentsCount = workspace.establishments.filter(
    (establishment) => establishment.organizationId === organization.id,
  ).length;
  const isFirstEstablishment = organizationEstablishmentsCount === 0;

  if (!workspace.canCreateEstablishment && !isFirstEstablishment) {
    redirect(workspace.subscription?.canManageBilling ? "/upgrade" : "/access-denied");
  }

  const showCancel = hasSomewhereToCancelTo(
    workspace.establishments,
    organization.id,
    workspace.onboardingCompleted,
  );

  return (
    <CreateEstablishmentForm
      organizationId={organization.id}
      showCancel={showCancel}
    />
  );
}
