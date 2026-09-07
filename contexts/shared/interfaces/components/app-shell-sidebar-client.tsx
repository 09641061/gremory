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

  // Welcome intentionally keeps the application sidebar: users must retain
  // profile, invoice and sign-out controls while activating their account.
  const isWelcomeRoute = pathname === "/welcome";
  const isSetupRoute = isWelcomeRoute || pathname === "/organizations/new";
  const isAccountStateRoute =
    isSetupRoute ||
    pathname === "/invitations/pending" ||
    pathname === "/access-denied" ||
    pathname === "/no-access";
  const showBillingMenu =
    isAccountStateRoute || workspace.accessPolicy?.canManageBilling === true;

  return (
    <AppSidebar
      initialAssistantConversations={initialAssistantConversations}
      currentProfile={currentProfile}
      workspace={workspace}
      visibleRoutes={visibleRoutes}
      showAssistantSection={showAssistantSection}
      showAssistantNavigation={showAssistantNavigation}
      showWorkspaceSwitcher={showWorkspaceSwitcher && !isSetupRoute}
      pathname={pathname}
      showBillingMenu={showBillingMenu}
    />
  );
}
