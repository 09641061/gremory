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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";

const navigation = [
  { label: "New Chat", href: "/chat", icon: MessageCircle },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "CRM", href: "/crm", icon: ContactRound },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppSidebar({
  initialAssistantConversations,
  currentProfile,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
  planId,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  planId?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
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
    <ShadcnSidebar
      collapsible="none"
      className="fixed inset-y-0 top-14 z-20 hidden h-[calc(100svh-3.5rem)] md:flex"
    >
        <SidebarContent className="px-3 py-3">
          <SidebarGroup className="mt-2 p-0">
            <SidebarGroupContent>
              <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
                {filteredNavigation.map(({ label, href, icon: Icon }) => {
                  const active =
                    href === "/chat"
                      ? pathname === href && !selectedConversationId
                      : pathname === href || pathname.startsWith(`${href}/`);
                  const establishmentId = searchParams.get("establishmentId");
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
            />
          ) : null}
        </SidebarContent>

        <SidebarFooter className="px-3 pb-3">
          <SidebarProfile
            profile={currentProfile}
            settingsHref={
              searchParams.get("establishmentId")
                ? `/settings?establishmentId=${searchParams.get("establishmentId")}`
                : "/settings"
            }
            active={pathname === "/settings" || pathname.startsWith("/settings/")}
          />
        </SidebarFooter>
    </ShadcnSidebar>
  );
}
