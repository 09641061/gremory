"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CircleArrowUp, LogOut, MoreHorizontal, Receipt, User, UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { signOutAction } from "@/contexts/iam/interfaces/actions/sign-out.action";
import { NotificationDropdown } from "@/contexts/notifications/interfaces/components/notification-dropdown";
import { cn } from "@/lib/utils";

type SidebarProfileProps = {
  profile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  profileHref: string;
  upgradeHref?: string;
  invoiceHref?: string;
  canManageBilling?: boolean;
  /** Highlights the trigger while the settings route is open. */
  active?: boolean;
};

/**
 * Sidebar footer account control.
 *
 * The `ChevronsUpDown` affordance promises a menu, so the trigger opens one
 * instead of navigating straight to the profile page.
 */
export function SidebarProfile({
  profile,
  profileHref,
  upgradeHref = "/upgrade",
  invoiceHref = "/invoice",
  canManageBilling = true,
  active = false,
}: SidebarProfileProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const username = profile?.username?.trim() || "Profile";

  function handleLogout() {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.status === "success") {
        router.replace("/login");
      }
    });
  }
  const imageUrl = profile?.imageUrl;

  return (
    <div
      data-slot="sidebar-profile-card"
      className={cn(
        "flex w-full items-center justify-between gap-1 rounded-(--app-sidebar-item-radius) border border-border/60 bg-card p-1 shadow-xs transition-colors",
        active && "border-accent/40 bg-accent/30",
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "group/profile flex min-w-0 flex-1 items-center gap-(--app-sidebar-control-gap) rounded-[calc(var(--app-sidebar-item-radius)-2px)] px-1.5 py-1 text-left outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
          )}
          title={username}
        >
          <Avatar className="size-(--app-sidebar-avatar-size) shrink-0 border border-border/60 bg-muted">
            {/* Above the fold on every route, so it competes for bandwidth. */}
            <AvatarImage src={imageUrl ?? undefined} alt={username} fetchPriority="high" />
            <AvatarFallback className="bg-muted text-muted-foreground">
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
            </AvatarFallback>
          </Avatar>

          <span className="min-w-0 flex-1 truncate text-xs font-medium text-foreground">
            {username}
          </span>

          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
              "group-hover/profile:bg-accent group-hover/profile:text-accent-foreground",
              "group-data-[popup-open]/profile:bg-accent group-data-[popup-open]/profile:text-accent-foreground",
              "group-aria-expanded/profile:bg-accent group-aria-expanded/profile:text-accent-foreground",
              active && "text-accent-foreground",
            )}
            aria-hidden="true"
          >
            <MoreHorizontal className="size-4" />
          </span>
        </DropdownMenuTrigger>

        {/* Opens upward: the trigger sits in the sidebar footer. */}
        <DropdownMenuContent
          side="top"
          align="start"
          className="w-(--anchor-width) min-w-56"
        >
          <DropdownMenuItem render={<Link href={profileHref} />}>
            <UserRound aria-hidden="true" />
            Profile
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

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={pending}
            onClick={handleLogout}
          >
            <LogOut aria-hidden="true" />
            {pending ? "Signing out..." : "Log out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <NotificationDropdown variant="compact" />
    </div>
  );
}
