"use client";

import { usePathname } from "next/navigation";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import { AppSidebar } from "./app-sidebar";

interface AppShellSidebarClientProps {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  workspace: WorkspaceHeaderViewModel;
  homeHref?: string | null;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  showWorkspaceSwitcher: boolean;
  showNavigation?: boolean;
}

export function AppShellSidebarClient({
  initialAssistantConversations,
  currentProfile,
  workspace,
  homeHref,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
  showWorkspaceSwitcher,
  showNavigation = true,
}: AppShellSidebarClientProps) {
  // Use client pathname for active state detection and route checks
  const pathname = usePathname();

  const isSetupRoute = pathname === "/organizations/new";

  return (
    <AppSidebar
      initialAssistantConversations={initialAssistantConversations}
      workspace={workspace}
      profile={currentProfile}
      homeHref={homeHref}
      visibleRoutes={visibleRoutes}
      showAssistantSection={showAssistantSection}
      showAssistantNavigation={showAssistantNavigation}
      showWorkspaceSwitcher={showWorkspaceSwitcher && !isSetupRoute}
      showNavigation={showNavigation}
      pathname={pathname}
    />
  );
}
