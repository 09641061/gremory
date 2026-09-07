import { Suspense } from "react";
import { redirect } from "next/navigation";
import { CreateOrganizationForm } from "@/contexts/business/interfaces/components/organization/create-organization/create-organization-form";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { hasSomewhereToCancelTo } from "@/contexts/business/domain/services/workspace-navigation.policy";
import { PageLoading } from "@/contexts/shared/interfaces/components/page-loading";

export default function NewOrganizationPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <NewOrganizationPageContent />
    </Suspense>
  );
}

async function NewOrganizationPageContent() {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();

  // An account without an organization has an invitation to accept first.
  if (workspace.accountType === "PENDING_INVITATION") {
    redirect("/invitations/pending");
  }

  // An account that already owns an organization has nothing left to set up
  // here, regardless of account type or onboarding state - it creates
  // establishments inside that organization instead of a second one.
  // The onboarding status is authoritative here. Keeping this page reachable
  // while organization onboarding is pending prevents `/` from redirecting
  // back to this route forever when an older workspace response has a stale
  // `ownedOrganizationId` value.
  if (!workspace.canCreateOrganization && workspace.onboardingStatus !== "ORGANIZATION_PENDING") {
    redirect("/");
  }

  const showCancel = hasSomewhereToCancelTo(
    workspace.establishments,
    workspace.organization?.id,
    workspace.onboardingCompleted,
  );

  return <CreateOrganizationForm showCancel={showCancel} />;
}
