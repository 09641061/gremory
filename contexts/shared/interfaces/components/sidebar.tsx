"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ContactRound,
  MessageCircle,
  Package,
  Settings,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "New Chat", href: "/chat", icon: MessageCircle },
  { label: "Schedule", href: "/schedule", icon: CalendarDays },
  { label: "CRM", href: "/crm", icon: ContactRound },
  { label: "Catalog", href: "/catalog", icon: Package },
  { label: "Team", href: "/team", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar({
  initialAssistantConversations,
  canReadCatalog = true,
  canReadCrm = true,
  canReadTeam = true,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  canReadCatalog?: boolean;
  canReadCrm?: boolean;
  canReadTeam?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;

  const filteredNavigation = navigation.filter(item => {
    if (item.label === "Catalog") {
      return canReadCatalog;
    }
    if (item.label === "CRM") {
      return canReadCrm;
    }
    if (item.label === "Team") {
      return canReadTeam;
    }
    return true;
  });

  return (
    <aside className="fixed bottom-0 left-0 top-14 z-20 hidden w-60 shrink-0 border-r border-border/60 bg-background px-3 py-3 md:flex md:flex-col">
      <nav aria-label="Modulos" className="mt-2">
        <ul className="space-y-1">
          {filteredNavigation.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/chat"
                ? pathname === href && !selectedConversationId
                : pathname === href || pathname.startsWith(`${href}/`);

            const establishmentId = searchParams.get("establishmentId");
            const linkHref = establishmentId ? `${href}?establishmentId=${establishmentId}` : href;

            return (
              <li key={label}>
                <Link
                  href={linkHref}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                    active && "!bg-accent !text-accent-foreground hover:!bg-accent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-5 text-muted-foreground",
                      active && "text-accent-foreground",
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

      <AssistantChatsSection initialConversations={initialAssistantConversations} />

      <nav aria-label="Configuracion" className="mt-auto pt-5">
        <ul>
          <li>
            <Link
              href={searchParams.get("establishmentId") ? `/settings?establishmentId=${searchParams.get("establishmentId")}` : "/settings"}
              aria-current={
                pathname === "/settings" || pathname.startsWith("/settings/")
                  ? "page"
                  : undefined
              }
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground hover:bg-accent/70 hover:text-accent-foreground",
                (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                  "!bg-accent !text-accent-foreground hover:!bg-accent",
              )}
            >
              <Settings
                className={cn(
                  "size-5 text-muted-foreground",
                  (pathname === "/settings" || pathname.startsWith("/settings/")) &&
                    "text-accent-foreground",
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
