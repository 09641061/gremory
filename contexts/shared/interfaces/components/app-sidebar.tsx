"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CircleArrowUp,
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
  SidebarSeparator,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";

import { useI18n, LocaleSync } from "@/contexts/shared/interfaces/i18n";

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
  showWorkspaceSwitcher = true,
  pathname: pathnameProp,
  showBillingMenu,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> & { language?: "ES" | "EN" } | null;
  workspace: WorkspaceHeaderViewModel;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  showWorkspaceSwitcher?: boolean;
  pathname?: string;
  showBillingMenu?: boolean;
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
  const canManageBilling = showBillingMenu ?? workspace.accessPolicy?.canManageBilling ?? false;
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
    <ShadcnSidebar collapsible="offcanvas">
      <LocaleSync profileLanguage={currentProfile?.language} />
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

      <SidebarFooter className="gap-2 px-3 pb-3">
        {(() => {
          const hasActiveSubscription = workspace.subscription?.active === true;
          const buttonText = hasActiveSubscription ? "Upgrade" : "Get Started";
          return (
            <Link
              href="/upgrade"
              className="flex h-(--app-sidebar-control-height) items-center gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-xs font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground"
            >
              <CircleArrowUp className="size-(--app-sidebar-icon-size) shrink-0" />
              <span>{buttonText}</span>
            </Link>
          );
        })()}

        <SidebarProfile
          profile={currentProfile}
          profileHref="/profile"
          canManageBilling={canManageBilling}
          invoiceHref={establishmentId ? `/invoice?establishmentId=${establishmentId}` : "/invoice"}
          active={
            pathname === "/profile" ||
            pathname.startsWith("/profile/") ||
            pathname === "/invoice" ||
            pathname.startsWith("/invoice/")
          }
        />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
