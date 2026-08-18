import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export function resolveModuleAccessFallback(workspace: WorkspaceHeaderViewModel): "/upgrade" | "/access-denied" {
  if (
    workspace.accountType === "OWNER" &&
    workspace.subscription?.active === false &&
    workspace.accessPolicy?.canManageBilling === true
  ) {
    return "/upgrade";
  }

  return "/access-denied";
}
