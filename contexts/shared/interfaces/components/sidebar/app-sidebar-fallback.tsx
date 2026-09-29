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
  SidebarSeparator,
} from "@/contexts/shared/interfaces/components/ui/sidebar";
import { Skeleton } from "@/contexts/shared/interfaces/components/ui/skeleton";

const NAV_PLACEHOLDER_ROWS = [0, 1, 2, 3, 4, 5];

/**
 * Streaming placeholder for {@link AppSidebar}.
 *
 * Mirrors the unified sidebar layout (header + content + footer) so the
 * content area does not reflow while {@link AppShellSidebarServer} resolves.
 */
export function AppSidebarFallback() {
  return (
    <ShadcnSidebar collapsible="offcanvas" className="inset-y-0 h-svh">
      <SidebarHeader className="border-b border-border/60 px-3 py-2">
        <div className="flex h-(--app-sidebar-header-height) items-center">
          <Skeleton className="h-5 w-16" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-3">
        <div className="mb-2">
          <Skeleton className="h-(--app-sidebar-profile-height) w-full rounded-(--app-sidebar-item-radius)" />
        </div>
        <SidebarGroup className="mt-2 p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-(--app-sidebar-menu-gap)">
              {NAV_PLACEHOLDER_ROWS.map((row) => (
                <SidebarMenuItem key={row}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="mx-0 my-2" />
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-border/60 px-2 py-2">
        <div className="flex items-center gap-1">
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="h-8 flex-1 rounded-md" />
        </div>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
