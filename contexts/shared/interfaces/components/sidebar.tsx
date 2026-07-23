"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronsUpDown,
  ContactRound,
  LayoutGrid,
  Package,
  Users,
} from "lucide-react";

import {
  Button,
  buttonVariants,
} from "@/contexts/shared/interfaces/components/ui/button";
import { Card } from "@/contexts/shared/interfaces/components/ui/card";
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

      <Card className="shrink-0 rounded-lg border-border bg-card p-3 shadow-sm ring-0">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-between gap-2 p-0 text-left hover:bg-transparent"
          aria-label="Cambiar local"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Building2 className="size-5" strokeWidth={2.2} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-xs leading-4 text-muted-foreground">
                Local seleccionado
              </span>
              <span className="block truncate text-sm font-semibold leading-5 text-foreground">
                Miraflores
              </span>
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" strokeWidth={2.4} />
        </Button>
      </Card>

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
    </aside>
  );
}
