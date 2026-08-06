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

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { AssistantChatsSection } from "@/contexts/assistant/interfaces/components/sidebar/assistant-chats-section";
import type { AssistantConversationSummaryReadModel } from "@/contexts/assistant/application/internal/transforms/assistant.read-models";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { SidebarProfile } from "@/contexts/profiles/interfaces/components/profile/sidebar-profile";
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
  currentProfile,
  canReadCatalog = true,
  canReadCrm = true,
  canReadTeam = true,
  canReadScheduling = true,
  showAssistantSection = true,
}: {
  initialAssistantConversations: AssistantConversationSummaryReadModel[];
  currentProfile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  canReadCatalog?: boolean;
  canReadCrm?: boolean;
  canReadTeam?: boolean;
  canReadScheduling?: boolean;
  showAssistantSection?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedConversationId = pathname.startsWith("/chat")
    ? searchParams.get("conversationId")
    : null;
  const assistantChatsSectionKey = initialAssistantConversations
    .map((conversation) => `${conversation.id}:${conversation.updatedAt}:${conversation.title ?? ""}`)
    .join("|");

  const filteredNavigation = navigation.filter(item => {
    if (item.label === "Schedule") {
      return canReadScheduling;
    }
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

      {showAssistantSection ? (
        <AssistantChatsSection
          key={assistantChatsSectionKey}
          initialConversations={initialAssistantConversations}
        />
      ) : null}

      <div className="mt-auto pt-5">
        <SidebarProfile
          profile={currentProfile}
          href={
            searchParams.get("establishmentId")
              ? `/settings?establishmentId=${searchParams.get("establishmentId")}`
              : "/settings"
          }
          active={pathname === "/settings" || pathname.startsWith("/settings/")}
        />
      </div>
    </aside>
  );
}
