"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronsUpDown, CircleArrowUp, LogOut, Receipt, User, UserRound } from "lucide-react";

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
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="size-4 text-muted-foreground" aria-hidden="true" />
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
  );
}
