"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ContactRound,
  MessageCircle,
  Package,
  Users,
} from "lucide-react";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";
import { SidebarUpgradeCallout } from "@/contexts/billing/interfaces/components/subscription/sidebar-upgrade-callout";
import { canOfferUpgrade } from "@/contexts/billing/domain/services/subscription-upgrade.policy";

const navigation = [
  { label: "New Chat", href: "/chat", icon: MessageCircle },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "CRM", href: "/crm", icon: ContactRound },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

/**
 * The application's only chrome: workspace, navigation and account all live in
 * this one column, so the content area starts at the top of the viewport.
 */
export function AppSidebar({
  initialAssistantConversations,
  currentProfile,
  workspace,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  workspace: WorkspaceHeaderViewModel;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
  const requestedEstablishmentId = searchParams.get("establishmentId");
  const establishmentId =
    requestedEstablishmentId &&
    workspace.establishments.some((item) => item.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId ?? null;
  const canManageBilling = workspace.accessPolicy?.canManageBilling ?? workspace.subscription?.canManageBilling ?? false;
  const assistantChatsSectionKey = initialAssistantConversations
    .map((conversation) => `${conversation.id}:${conversation.updatedAt}:${conversation.title ?? ""}`)
    .join("|");

  const visibleRouteSet = new Set(visibleRoutes);
  const filteredNavigation = navigation.filter((item) => {
    if (!showAssistantNavigation && item.href === "/chat") {
      return false;
    }
    return visibleRouteSet.has(item.href as SidebarRouteId);
  });
  return (
    <ShadcnSidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border/60 p-3">
        <WorkspaceSwitcher workspace={workspace} />
      </SidebarHeader>

      <SidebarContent className="px-3 py-3 overflow-hidden">
        <SidebarGroup className="mt-2 p-0">
          <SidebarGroupContent className="shrink-0">
            <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
              {filteredNavigation.map(({ label, href, icon: Icon }) => {
                const active =
                  href === "/chat"
                    ? pathname === href && !selectedConversationId
                    : pathname === href || pathname.startsWith(`${href}/`);
                const linkHref = establishmentId
                  ? `${href}?establishmentId=${establishmentId}`
                  : href;

                return (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton
                      render={
                        <Link
                          href={linkHref}
                          aria-current={active ? "page" : undefined}
                        />
                      }
                      isActive={active}
                      size="default"
                      tooltip={label}
                      className="h-(--app-sidebar-control-height)"
                    >
                      <Icon strokeWidth={2} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAssistantSection ? (
          <AssistantChatsSection
            key={assistantChatsSectionKey}
            initialConversations={initialAssistantConversations}
            establishmentId={establishmentId}
          />
        ) : null}
      </SidebarContent>

      <SidebarFooter className="gap-2 px-3 pb-3">
        {canManageBilling && canOfferUpgrade(workspace.subscription) ? <SidebarUpgradeCallout /> : null}

        <SidebarProfile
          profile={currentProfile}
          settingsHref={
            establishmentId ? `/settings?establishmentId=${establishmentId}` : "/settings"
          }
          canManageBilling={canManageBilling}
          invoiceHref={establishmentId ? `/invoice?establishmentId=${establishmentId}` : "/invoice"}
          active={
            pathname === "/settings" ||
            pathname.startsWith("/settings/") ||
            pathname === "/invoice" ||
            pathname.startsWith("/invoice/")
          }
        />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
