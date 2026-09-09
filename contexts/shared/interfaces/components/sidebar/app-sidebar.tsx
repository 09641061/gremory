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
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";

import { useI18n } from "@/contexts/shared/interfaces/i18n";

/**
 * Workspace and application navigation. Account controls live in AppHeader.
 */
export function AppSidebar({
  initialAssistantConversations,
  workspace,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
  showWorkspaceSwitcher = true,
  pathname: pathnameProp,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  workspace: WorkspaceHeaderViewModel;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  showWorkspaceSwitcher?: boolean;
  pathname?: string;
}) {
  const { t } = useI18n();
  const currentPathname = usePathname();
  const pathname = pathnameProp ?? currentPathname;
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
  const assistantChatsSectionKey = initialAssistantConversations
    .map((conversation) => `${conversation.id}:${conversation.updatedAt}:${conversation.title ?? ""}`)
    .join("|");

  const navigation = [
    { label: t.navigation.newChat, href: "/chat", icon: MessageCircle },
    { label: t.navigation.schedule, href: "/schedule", icon: CalendarDays },
    { label: t.navigation.crm, href: "/crm", icon: ContactRound },
    { label: t.navigation.catalog, href: "/catalog", icon: Package },
    { label: t.navigation.team, href: "/team", icon: Users },
    { label: t.navigation.analytics, href: "/analytics", icon: BarChart3 },
  ];

  const visibleRouteSet = new Set(visibleRoutes);
  const filteredNavigation = navigation.filter((item) => {
    if (!showAssistantNavigation && item.href === "/chat") {
      return false;
    }
    return visibleRouteSet.has(item.href as SidebarRouteId);
  });
  return (
    <ShadcnSidebar collapsible="offcanvas" className="top-16 h-[calc(100svh-4rem)]">
      {showWorkspaceSwitcher && (
        <SidebarHeader className="border-b border-border/60 p-3">
          <WorkspaceSwitcher workspace={workspace} />
        </SidebarHeader>
      )}

      <SidebarContent className="overflow-hidden px-3 py-3">
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
          <>
            <SidebarSeparator className="mx-0 my-2" />
            <AssistantChatsSection
              key={assistantChatsSectionKey}
              initialConversations={initialAssistantConversations}
              establishmentId={establishmentId}
            />
          </>
        ) : null}
      </SidebarContent>
    </ShadcnSidebar>
  );
}
