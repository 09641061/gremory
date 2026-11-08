"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

import { useSidebarRoutes } from "./use-sidebar-routes";

/**
 * Workspace and application navigation. Account controls live in AppHeader.
 *
 * Renders navigation exclusively through `useSidebarRoutes`, which owns the
 * permission filtering, active-link resolution and establishment-id wiring so
 * this component stays focused on composition and presentation.
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
  const currentPathname = usePathname();
  const pathname = pathnameProp ?? currentPathname;

  const { entries: navigationEntries, establishmentId } = useSidebarRoutes({
    visibleRoutes,
    showAssistantNavigation,
    pathname,
    workspace,
  });

  // Stable key for the assistant chats section so it re-mounts when the list
  // shape changes (new conversation, title update, etc.).
  const assistantChatsSectionKey = initialAssistantConversations
    .map((conversation) => `${conversation.id}:${conversation.updatedAt}:${conversation.title ?? ""}`)
    .join("|");

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
              {navigationEntries.map(({ label, href, icon: Icon, active, linkHref }) => (
                <SidebarMenuItem key={href}>
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
              ))}
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
