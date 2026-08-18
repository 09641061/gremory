import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { redirect } from "next/navigation";

export default async function NewOrganizationPage() {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();

  // An account without an organization has an invitation to accept first.
  if (workspace.accountType === "PENDING_INVITATION") {
    redirect("/invitations/pending");
  }

  // An account that already owns an organization has nothing left to set up
  // here, regardless of account type or onboarding state - it creates
  // establishments inside that organization instead of a second one.
  if (!workspace.canCreateOrganization) {
    redirect("/");
  }

  const showCancel = hasSomewhereToCancelTo(
    workspace.establishments,
    workspace.organization?.id,
    workspace.onboardingCompleted,
  );

  return <CreateOrganizationForm showCancel={showCancel} />;
}
