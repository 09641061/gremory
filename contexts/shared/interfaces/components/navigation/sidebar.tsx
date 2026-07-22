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
} from "lucide-react";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarFooter } from "./sidebar-footer";
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

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* Botón de gatillo para pantallas móviles */}
      <div className="lg:hidden fixed top-3 left-4 z-50">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
          className="flex size-10 items-center justify-center rounded-lg bg-card border border-border shadow-xs hover:bg-accent text-foreground transition-colors"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Backdrop overlay para móvil */}
      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
        />
      )}

      {/* Sidebar Principal (Escritorio y Móvil Drawer) */}
      <aside
        className={cn(
          "flex flex-col h-screen w-64 bg-card border-r border-border p-4 z-40 transition-transform duration-200 ease-in-out",
          // Escritorio: fijo a la izquierda
          "hidden lg:flex lg:fixed lg:top-0 lg:left-0",
          // Móvil: drawer deslizante
          mobileOpen
            ? "flex fixed top-0 left-0 translate-x-0 shadow-2xl"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Cabecera / Marca */}
        <div className="pt-2 pb-6 px-1">
          <SidebarBrand />
        </div>

        {/* Menú Principal */}
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
                onClick={closeMobile}
              />
            );
          })}
        </nav>

        {/* Sección Inferior / Footer */}
        <SidebarFooter currentPathname={pathname} onItemClick={closeMobile} />
      </aside>
    </>
  );
}
