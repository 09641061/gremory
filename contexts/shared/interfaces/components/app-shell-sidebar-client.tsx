"use client";

import { usePathname } from "next/navigation";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import { AppSidebar } from "./app-sidebar";

interface AppShellSidebarClientProps {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  workspace: WorkspaceHeaderViewModel;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  showWorkspaceSwitcher: boolean;
}

export function AppShellSidebarClient({
  initialAssistantConversations,
  currentProfile,
  workspace,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
  showWorkspaceSwitcher,
}: AppShellSidebarClientProps) {
  // Use client pathname for active state detection and route checks
  const pathname = usePathname();

  // Hide workspace switcher on welcome route
  const isWelcomeRoute = pathname === "/welcome";

  // Always show billing menu (invoices, upgrade) - even on welcome/onboarding
  const showBillingMenu = true;

  return (
    <AppSidebar
      initialAssistantConversations={initialAssistantConversations}
      currentProfile={currentProfile}
      workspace={workspace}
      visibleRoutes={visibleRoutes}
      showAssistantSection={showAssistantSection}
      showAssistantNavigation={showAssistantNavigation}
      showWorkspaceSwitcher={showWorkspaceSwitcher && !isWelcomeRoute}
      pathname={pathname}
      showBillingMenu={showBillingMenu}
    />
  );
}
