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

  // An owner who already finished onboarding has nothing left to set up here.
  // A member reaches this page voluntarily to start their own business, at
  // any onboarding state, so only the owner branch redirects away.
  if (workspace.accountType === "OWNER" && workspace.onboardingStatus !== "ORGANIZATION_PENDING") {
    redirect("/");
  }

  const showCancel = hasSomewhereToCancelTo(
    workspace.establishments,
    workspace.organization?.id,
    workspace.onboardingCompleted,
  );

  return <CreateOrganizationForm showCancel={showCancel} />;
}
