import { redirect } from "next/navigation";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import {
  NoPendingInvitationView,
  PendingInvitationView,
} from "@/contexts/workforce/interfaces/components/invitations/pending-invitation-view";

export default async function PendingInvitationPage() {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel();

  // An account that already belongs somewhere has nothing to accept.
  if (workspace.accountType !== "PENDING_INVITATION") {
    redirect("/");
  }

  return workspace.pendingInvitation ? (
    <PendingInvitationView invitation={workspace.pendingInvitation} />
  ) : (
    <NoPendingInvitationView />
  );
}
