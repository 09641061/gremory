import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export function resolveModuleAccessFallback(
  workspace: WorkspaceHeaderViewModel,
): "/upgrade" | "/no-access" | "/access-denied" {
  if (
    workspace.accountType === "OWNER" &&
    workspace.subscription?.active === false &&
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
