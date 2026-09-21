"use client";

import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ContactRound,
  MessageCircle,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { SidebarRouteId } from "@/contexts/shared/application/model/app-shell.view-models";
import type { WorkspaceHeaderViewModel } from "@/contexts/business/application/model/business-workspace.view-models";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

/**
 * One navigation entry produced by {@link useSidebarRoutes}. The icon is the
 * Lucide component reference (forwarded by the renderer), not a node, so the
 * caller stays in control of size/stroke props.
 */
export type SidebarNavigationEntry = Readonly<{
  href: SidebarRouteId;
  label: string;
  icon: LucideIcon;
  active: boolean;
  linkHref: string;
}>;

export type UseSidebarRoutesResult = Readonly<{
  /**
   * Resolved `establishmentId` for the current workspace. Mirrored on each
   * entry's `linkHref` query string; exposed separately so siblings (e.g. the
   * assistant chats section) can scope themselves to the same establishment
   * without re-deriving the lookup rules.
   */
  establishmentId: string | null;
  /** Entries to render, in order, after permission filtering. */
  entries: ReadonlyArray<SidebarNavigationEntry>;
}>;

export type UseSidebarRoutesOptions = Readonly<{
  /**
   * Routes the active workspace permits. Anything outside this set is filtered
   * out before render, independent of the canonical sidebar list.
   */
  visibleRoutes: ReadonlyArray<SidebarRouteId>;
  /**
   * Whether the workspace may access the assistant. When false, the chat entry
   * is hidden even if `/chat` is in `visibleRoutes`.
   */
  showAssistantNavigation: boolean;
  /** Current pathname used for active-link resolution. */
  pathname: string;
  /** Workspace view model used to resolve the active establishment id. */
  workspace: WorkspaceHeaderViewModel;
}>;

/**
 * Computes the navigation entries rendered in the app sidebar.
 *
 * Encapsulates the logic that mixes UI and navigation/permission concerns:
 * - builds the canonical sidebar items (label, href, icon)
 * - filters by workspace permissions (`visibleRoutes`) and assistant availability
 * - resolves which entry is active given the current pathname and the open
 *   assistant conversation
 * - resolves the `establishmentId` query parameter to append from the workspace
 *
 * Keeps `app-sidebar.tsx` focused on rendering: it only iterates the returned
 * entries and renders them.
 */
export function useSidebarRoutes({
  visibleRoutes,
  showAssistantNavigation,
  pathname,
  workspace,
}: UseSidebarRoutesOptions): UseSidebarRoutesResult {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  // The selected assistant conversation, when present, takes over the `/chat`
  // entry's active state so the sidebar matches what the user is looking at.
  const selectedConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;

  // Trust `establishmentId` from the URL only if the workspace actually has
  // access to that establishment; otherwise fall back to the workspace's own
  // active establishment, so the link keeps the user in their context.
  const requestedEstablishmentId = searchParams.get("establishmentId");
  const establishmentId =
    requestedEstablishmentId &&
    workspace.establishments.some((item) => item.id === requestedEstablishmentId)
      ? requestedEstablishmentId
      : workspace.activeEstablishmentId ?? null;

  // Canonical navigation list. Order here is the rendered order.
  const canonicalEntries: ReadonlyArray<
    Pick<SidebarNavigationEntry, "href" | "label" | "icon">
  > = [
    { label: t.navigation.newChat, href: "/chat", icon: MessageCircle },
    { label: t.navigation.schedule, href: "/schedule", icon: CalendarDays },
    { label: t.navigation.crm, href: "/crm", icon: ContactRound },
    { label: t.navigation.catalog, href: "/catalog", icon: Package },
    { label: t.navigation.team, href: "/team", icon: Users },
    { label: t.navigation.analytics, href: "/analytics", icon: BarChart3 },
  ];

  const visibleRouteSet = new Set<SidebarRouteId>(visibleRoutes);

  const entries = canonicalEntries
    .filter(({ href }) => {
      // The assistant nav is its own gate: even if `/chat` is listed as visible
      // for the workspace, the user must have assistant access to see it.
      if (!showAssistantNavigation && href === "/chat") {
        return false;
      }
      return visibleRouteSet.has(href);
    })
    .map<SidebarNavigationEntry>((entry) => {
      const isChat = entry.href === "/chat";
      const active = isChat
        ? pathname === entry.href && !selectedConversationId
        : pathname === entry.href || pathname.startsWith(`${entry.href}/`);
      const linkHref = establishmentId
        ? `${entry.href}?establishmentId=${establishmentId}`
        : entry.href;
      return { ...entry, active, linkHref };
    });

  return { establishmentId, entries };
}