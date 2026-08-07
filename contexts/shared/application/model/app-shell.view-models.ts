import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export type SidebarRouteId =
  | "/chat"
  | "/schedule"
  | "/crm"
  | "/catalog"
  | "/team"
  | "/analytics";

export type AppShellViewModel = Readonly<{
  workspace: WorkspaceHeaderViewModel;
  hasAssistantAccess: boolean;
  homeHref: "/chat" | "/schedule" | "/crm" | "/catalog" | "/team" | "/organizations";
  visibleSidebarRoutes: ReadonlyArray<SidebarRouteId>;
}>;
