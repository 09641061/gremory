import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export type SidebarRouteId =
  | "/chat"
  | "/schedule"
  | "/crm"
  | "/catalog"
  | "/team"
  | "/analytics"
  | "/audit-log";

// Account-scoped navigation only. Establishment entry points depend on the
// organization the user has selected in the header, so they are resolved from
// the per-organization flags of the workspace view model instead.
export type HeaderNavigationViewModel = Readonly<{
  organizationListHref: string | null;
  newOrganizationHref: string | null;
}>;

export type AppShellViewModel = Readonly<{
  workspace: WorkspaceHeaderViewModel;
  hasAssistantAccess: boolean;
  homeHref: "/chat" | "/schedule" | "/crm" | "/catalog" | "/team" | "/organizations" | "/establishments/new" | "/access-denied";
  visibleSidebarRoutes: ReadonlyArray<SidebarRouteId>;
  headerNavigation: HeaderNavigationViewModel;
}>;
