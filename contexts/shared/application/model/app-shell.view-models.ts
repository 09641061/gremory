import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";

export type SidebarRouteId =
  | "/chat"
  | "/schedule"
  | "/crm"
  | "/catalog"
  | "/team"
  | "/analytics";

export type HeaderNavigationViewModel = Readonly<{
  organizationListHref: string | null;
  establishmentListHref: string | null;
  newEstablishmentHref: string | null;
}>;

export type AppShellViewModel = Readonly<{
  workspace: WorkspaceHeaderViewModel;
  hasAssistantAccess: boolean;
  homeHref: "/chat" | "/schedule" | "/crm" | "/catalog" | "/team" | "/organizations" | "/establishments/new" | "/access-denied";
  visibleSidebarRoutes: ReadonlyArray<SidebarRouteId>;
  headerNavigation: HeaderNavigationViewModel;
}>;
