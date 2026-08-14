"use client";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { Skeleton } from "@/contexts/shared/interfaces/components/ui/skeleton";

const PLACEHOLDER_ROWS = [0, 1, 2, 3, 4, 5];

/**
 * Streaming placeholder for {@link AppSidebar}.
 *
 * It reserves the same column so the content area never reflows once the
 * workspace resolves, which matters more now that the sidebar is the only chrome.
 */
export function AppSidebarFallback() {
  return (
    <ShadcnSidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border/60 p-3">
        <Skeleton className="h-(--app-sidebar-profile-height) w-full rounded-(--app-sidebar-item-radius)" />
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <SidebarGroup className="mt-2 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
              {PLACEHOLDER_ROWS.map((row) => (
                <SidebarMenuItem key={row}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 px-3 pb-3">
        <Skeleton className="h-(--app-sidebar-profile-height) w-full rounded-(--app-sidebar-item-radius)" />
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
