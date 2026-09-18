"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, CircleArrowUp, LogOut, Receipt, User, UserRound } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { signOutAction } from "@/contexts/iam/interfaces/actions/sign-out.action";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/shared/interfaces/i18n";

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
 * Existing account control, now hosted by the shared Header.
 * It deliberately has no SidebarProvider dependency.
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
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const username = profile?.username?.trim() || t.sidebarProfile.profile;

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
          "group/profile flex h-8 items-center gap-1 rounded-md px-1.5 py-1 text-left outline-none transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring/50",
          "data-popup-open:bg-accent data-popup-open:text-accent-foreground",
          active && "bg-accent text-accent-foreground",
        )}
        title={username}
        aria-label={username}
      >
        <Avatar className="size-7 shrink-0 bg-muted">
          {/* Above the fold on every route, so it competes for bandwidth. */}
          <AvatarImage src={imageUrl ?? undefined} alt={username} fetchPriority="high" />
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="size-3.5 text-muted-foreground" aria-hidden="true" />
          </AvatarFallback>
        </Avatar>

        <span className="hidden max-w-[8rem] truncate text-xs font-medium text-foreground sm:inline">
          {username}
        </span>

        <ChevronDown
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-popup-open/profile:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-(--anchor-width) min-w-56"
      >
        <DropdownMenuGroup>
        <DropdownMenuItem render={<Link href={profileHref} />}>
          <UserRound aria-hidden="true" />
          {t.sidebarProfile.profile}
        </DropdownMenuItem>

        {canManageBilling ? (
          <>
            <DropdownMenuItem render={<Link href={upgradeHref} />}>
              <CircleArrowUp aria-hidden="true" />
              {t.sidebarProfile.upgradePlan}
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link href={invoiceHref} />}>
              <Receipt aria-hidden="true" />
              {t.sidebarProfile.invoices}
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
          {pending ? t.sidebarProfile.signingOut : t.sidebarProfile.logOut}
        </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
