import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";

export function resolveModuleAccessFallback(
  workspace: WorkspaceHeaderViewModel,
): "/upgrade" | "/no-access" | "/access-denied" {
  if (
    workspace.accountType === "OWNER" &&
    !hasActiveSubscription(workspace.subscription) &&
    workspace.accessPolicy?.canManageBilling === true
  ) {
    return "/upgrade";
  }

  // Restricted state: the member has no roles or only roles without
  // permissions, so no module can be opened.
  if (workspace.authorization?.capabilities?.canOpenModules === false) {
    return "/no-access";
  }

  return "/access-denied";
}
