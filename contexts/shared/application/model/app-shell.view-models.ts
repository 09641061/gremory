import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export type SidebarRouteId =
  | "/chat"
  | "/schedule"
  | "/crm"
  | "/catalog"
  | "/team"
  | "/analytics";

export type AppShellHomeHref =
  | "/chat"
  | "/schedule"
  | "/crm"
  | "/catalog"
  | "/team"
  | "/organization"
  | "/establishments"
  | "/organizations/new"
  | "/establishments/new"
  | "/establishments/setup"
  | "/invitations/pending"
  | "/access-denied"
  | "/no-access";

export type AppShellViewModel = Readonly<{
  workspace: WorkspaceHeaderViewModel;
  hasAssistantAccess: boolean;
  homeHref: AppShellHomeHref;
  visibleSidebarRoutes: ReadonlyArray<SidebarRouteId>;
}>;
