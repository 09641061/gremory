"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  SidebarTrigger,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";
import { NotificationsProvider } from "@/contexts/notifications/interfaces/components/hooks/use-notifications";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { WorkspaceSwitcher } from "@/contexts/business/interfaces/components/workspace/workspace-switcher/workspace-switcher";

import { useSidebarRoutes } from "./use-sidebar-routes";

/**
 * Canonical landing route for an unauthenticated / shell-unavailable user.
 * Kept here (the single mount point for the brand link) so the constant has
 * exactly one home.
 */
export const APP_SIDEBAR_FALLBACK_HOME_HREF = "/welcome";

/**
 * Unified application chrome. Everything that used to live in the sticky
 * header (brand, notifications, profile) now lives in this single sidebar so
 * the route owns one shell instead of two.
 *
 * Layout, top to bottom:
 *   SidebarHeader      ← brand "Takodu" + (mobile) collapse trigger
 *   WorkspaceSwitcher  ← active establishment selector (when applicable)
 *   SidebarContent     ← navigation entries + AssistantChatsSection (scrollable)
 *   SidebarFooter      ← NotificationDropdown + SidebarProfile (sticky bottom)
 *
 * `NotificationsProvider` wraps the whole sidebar: it owns the single polling
 * interval for the unread badge regardless of which consumer renders it.
 *
 * Route / permission logic stays delegated to {@link useSidebarRoutes}; this
 * component stays focused on composition.
 */
export function AppSidebar({
  initialAssistantConversations,
  profile,
  workspace,
  homeHref,
  visibleRoutes,
  showAssistantSection,
  showAssistantNavigation,
  showWorkspaceSwitcher = true,
  showNavigation = true,
  pathname: pathnameProp,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  profile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  workspace: WorkspaceHeaderViewModel;
  /**
   * Server-resolved landing destination derived from the entry-route policy
   * (subscription state + access policy + account type). When omitted, the
   * brand link falls back to the canonical welcome route.
   */
  homeHref?: string | null;
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  showAssistantSection: boolean;
  showAssistantNavigation: boolean;
  showWorkspaceSwitcher?: boolean;
  /**
   * Hides the navigation group (used by routes that should expose account
   * controls but not the workspace nav, e.g. /welcome).
   */
  showNavigation?: boolean;
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

  const resolvedHomeHref = homeHref ?? APP_SIDEBAR_FALLBACK_HOME_HREF;
  const isHomeActive = pathname === resolvedHomeHref;
  const invoiceEstablishmentId = establishmentId ?? workspace?.activeEstablishmentId ?? null;

  const isAccountStateRoute = ["/welcome", "/organizations/new", "/invitations/pending", "/access-denied", "/no-access"].includes(pathname);
  const canManageBilling = isAccountStateRoute || workspace?.accessPolicy?.canManageBilling === true;

  // The welcome route only exposes brand + account controls: no workspace
  // switcher (no active workspace yet), no nav, no assistant section.
  const isWelcomeMode = pathname === "/welcome";
  const effectiveShowWorkspaceSwitcher = showWorkspaceSwitcher && !isWelcomeMode;
  const effectiveShowNavigation = showNavigation && !isWelcomeMode;
  const effectiveShowAssistantSection = showAssistantSection && !isWelcomeMode;

  return (
    <NotificationsProvider>
      <ShadcnSidebar collapsible="offcanvas" className="inset-y-0 h-svh">
        <SidebarHeader className="border-b border-border/60 px-3 py-2">
          <div className="flex h-(--app-sidebar-header-height) items-center justify-between gap-2">
            <Link
              href={resolvedHomeHref}
              aria-label="Takodu — go to home"
              aria-current={isHomeActive ? "page" : undefined}
              data-testid="app-sidebar-brand-link"
              className="-mx-2 inline-flex h-8 items-center rounded-md px-2 text-[15px] font-semibold tracking-tight text-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Takodu
            </Link>
            {/* Mobile collapse trigger; the sidebar is always visible on md+. */}
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>

        <SidebarContent className="overflow-hidden px-3 py-3">
          {effectiveShowWorkspaceSwitcher && (
            <div className="mb-2">
              <WorkspaceSwitcher workspace={workspace} />
            </div>
          )}

          {effectiveShowNavigation && (
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
          )}

          {effectiveShowAssistantSection && effectiveShowNavigation ? (
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

        <SidebarFooter className="mt-auto border-t border-border/60 px-2 py-2">
          <div className="flex items-center gap-1">
            <SidebarProfile
              profile={profile}
              profileHref="/profile"
              canManageBilling={canManageBilling}
              invoiceHref={invoiceEstablishmentId ? `/invoice?establishmentId=${invoiceEstablishmentId}` : "/invoice"}
              active={pathname === "/profile" || pathname.startsWith("/profile/") || pathname === "/invoice" || pathname.startsWith("/invoice/")}
              className="min-w-0 flex-1"
            />
            <NotificationDropdown variant="compact" />
          </div>
        </SidebarFooter>
      </ShadcnSidebar>
    </NotificationsProvider>
  );
}
