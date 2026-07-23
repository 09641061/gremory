"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ContactRound,
  LayoutGrid,
  Package,
  Settings,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "CRM", href: "/crm", icon: ContactRound },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 shrink-0 border-r border-border/60 bg-background px-3 py-3 md:flex md:flex-col">
      <h1 className="mb-4 px-2 text-lg font-bold leading-tight tracking-[-0.03em] text-foreground">
        Takodu
      </h1>

      <nav aria-label="Módulos" className="mt-5">
        <p className="mb-2 px-2 text-xs font-semibold text-foreground">
          Workspace
        </p>
        <ul className="space-y-1">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);

            return (
            <li key={label}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                  active && "!bg-accent !text-accent-foreground hover:!bg-accent"
                )}
              >
                <Icon
                  className={cn(
                    "size-5 text-muted-foreground",
                    active && "text-accent-foreground"
                  )}
                  strokeWidth={2}
                />
                <span>{label}</span>
              </Link>
            </li>
            );
          })}
        </ul>
      </nav>

      <nav aria-label="Configuración" className="mt-auto pt-5">
        <ul>
          <li>
            <Link
              href="/settings"
              aria-current={pathname === "/settings" || pathname.startsWith("/settings/") ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                  "!bg-accent !text-accent-foreground hover:!bg-accent"
              )}
            >
              <Settings
                className={cn(
                  "size-5 text-muted-foreground",
                  (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                    "text-accent-foreground"
                )}
                strokeWidth={2}
              />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
