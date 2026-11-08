import { CreateEstablishmentForm } from "@/contexts/business/interfaces/components/establishment/create-establishment/create-establishment-form";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { redirect } from "next/navigation";

interface NewEstablishmentPageProps {
  searchParams: Promise<{ establishmentId?: string; organizationId?: string }>;
}

export default async function NewEstablishmentPage({ searchParams }: NewEstablishmentPageProps) {
  const query = await searchParams;
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel(query);
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
        ? await composeBusinessAdapters().organizationQueryService.getById({ id: requestedOrganizationId })
        : null
      : workspace.organization;

  if (!organization) {
    redirect("/");
  }

  const organizationEstablishmentsCount = workspace.establishments.filter(
    (establishment) => establishment.organizationId === organization.id,
  ).length;
  const isFirstEstablishment = organizationEstablishmentsCount === 0;
  const canCreateFirstEstablishment =
    workspace.accountType === "OWNER" &&
    workspace.ownedOrganizationId === organization.id &&
    isFirstEstablishment;

  if (!workspace.canCreateEstablishment && !canCreateFirstEstablishment) {
    redirect(workspace.subscription?.canManageBilling ? "/upgrade" : "/");
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
