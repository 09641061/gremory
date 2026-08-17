"use client";

import Link from "next/link";
import { ChevronsUpDown, CircleArrowUp, Settings, Receipt } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { cn } from "@/lib/utils";

type SidebarProfileProps = {
  profile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  settingsHref: string;
  upgradeHref?: string;
  invoiceHref?: string;
  canManageBilling?: boolean;
  /** Highlights the trigger while the settings route is open. */
  active?: boolean;
};

function getProfileFallback(username: string) {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return "P";
  }

  return trimmedUsername.slice(0, 2).toUpperCase();
}

/**
 * Sidebar footer account control.
 *
 * The `ChevronsUpDown` affordance promises a menu, so the trigger opens one
 * instead of navigating straight to settings.
 */
export function SidebarProfile({
  profile,
  settingsHref,
  upgradeHref = "/upgrade",
  invoiceHref = "/invoice",
  canManageBilling = true,
  active = false,
}: SidebarProfileProps) {
  const username = profile?.username?.trim() || "Profile";
  const imageUrl = profile?.imageUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-(--app-sidebar-profile-height) w-full items-center gap-(--app-sidebar-control-gap) rounded-(--app-sidebar-item-radius) border border-border/60 bg-card px-(--app-sidebar-control-padding-x) text-left transition-colors outline-none",
          "hover:bg-accent/70 hover:text-accent-foreground",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-popup-open:bg-accent/70 data-popup-open:text-accent-foreground",
          active && "border-accent/40 bg-accent text-accent-foreground",
        )}
      >
        <Avatar className="size-(--app-sidebar-avatar-size) shrink-0 border border-border/60 bg-muted">
          {/* Above the fold on every route, so it competes for bandwidth. */}
          <AvatarImage src={imageUrl ?? undefined} alt="" fetchPriority="high" />
          <AvatarFallback className="bg-muted text-[0.7rem] font-semibold text-muted-foreground">
            {getProfileFallback(username)}
          </AvatarFallback>
        </Avatar>

        <span className="min-w-0 flex-1 truncate text-sm font-medium">{username}</span>

        <ChevronsUpDown
          className={cn(
            "size-(--app-sidebar-icon-size) shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground",
            active && "text-accent-foreground",
          )}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      {/* Opens upward: the trigger sits in the sidebar footer. */}
      <DropdownMenuContent
        side="top"
        align="start"
        className="w-(--anchor-width) min-w-56"
      >
        <DropdownMenuItem render={<Link href={settingsHref} />}>
          <Settings aria-hidden="true" />
          Settings
        </DropdownMenuItem>

        {canManageBilling ? (
          <>
            <DropdownMenuItem render={<Link href={upgradeHref} />}>
              <CircleArrowUp aria-hidden="true" />
              Upgrade plan
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link href={invoiceHref} />}>
              <Receipt aria-hidden="true" />
              Invoices
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
