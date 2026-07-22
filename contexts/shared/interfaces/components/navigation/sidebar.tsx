"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Building2,
  Settings,
  Menu,
  X,
  PanelLeftClose,
} from "lucide-react";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarFooter } from "./sidebar-footer";
import { useSidebar } from "./sidebar-context";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/billing",
    label: "Billing",
    icon: Receipt,
  },
  {
    href: "/establishments",
    label: "Establishments",
    icon: Building2,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
}

/**
 * Main responsive Sidebar component supporting collapse/expand interactions and mobile drawer mode.
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile trigger button (top left corner, visible only when mobile drawer is closed) */}
      {!mobileOpen && (
        <div className="lg:hidden fixed top-3 left-4 z-50">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="flex size-10 items-center justify-center rounded-lg bg-card border border-border shadow-xs hover:bg-accent text-foreground transition-colors cursor-pointer"
          >
            <Menu className="size-5" />
          </button>
        </div>
      )}

      {/* Mobile backdrop overlay */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          "flex flex-col h-screen bg-card border-r border-border p-3.5 z-40 transition-all duration-300 ease-in-out select-none",
          // Desktop width: w-20 when collapsed, w-64 when expanded
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Desktop: fixed left positioning
          "hidden lg:flex lg:fixed lg:top-0 lg:left-0",
          // Mobile: full drawer (always expanded w-64 for legibility on touch screens)
          mobileOpen
            ? "flex fixed top-0 left-0 w-64 translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Top Header with Brand and Collapse Toggle */}
        <div
          className={cn(
            "pt-1 pb-5 flex items-center justify-between",
            isCollapsed && "flex-col gap-3 pt-2 pb-4"
          )}
        >
          <SidebarBrand
            isCollapsed={mobileOpen ? false : isCollapsed}
            onExpand={toggleCollapse}
          />

          {/* Desktop Collapse Toggle Button (shown when expanded) */}
          {!isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
              className="hidden lg:flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            >
              <PanelLeftClose className="size-5" />
            </button>
          )}

          {/* Mobile Close Button inside Drawer Header (top right corner of open drawer) */}
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close navigation menu"
            className="lg:hidden flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <SidebarNavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={isActive}
                isCollapsed={mobileOpen ? false : isCollapsed}
                onClick={closeMobile}
              />
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <SidebarFooter
          currentPathname={pathname}
          isCollapsed={mobileOpen ? false : isCollapsed}
          onItemClick={closeMobile}
        />
      </aside>
    </>
  );
}
