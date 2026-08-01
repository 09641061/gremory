"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/contexts/shared/interfaces/components/ui/avatar";
import type { ProfileViewModel } from "@/contexts/profiles/application/services/profile.view-model";
import { cn } from "@/lib/utils";

type SidebarProfileProps = {
  profile: Pick<ProfileViewModel, "username" | "imageUrl"> | null;
  href: string;
  active?: boolean;
};

function getProfileFallback(username: string) {
  const trimmedUsername = username.trim();
  if (!trimmedUsername) {
    return "P";
  }

  return trimmedUsername.slice(0, 2).toUpperCase();
}

export function SidebarProfile({ profile, href, active = false }: SidebarProfileProps) {
  const username = profile?.username?.trim() || "Profile";
  const imageUrl = profile?.imageUrl;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-12 w-full items-center gap-3 rounded-md border border-border/60 bg-card px-3 text-left transition-colors",
        "hover:bg-accent/70 hover:text-accent-foreground",
        active && "border-accent/40 bg-accent text-accent-foreground",
      )}
    >
      <Avatar className="size-8 shrink-0 border border-border/60 bg-muted">
        <AvatarImage src={imageUrl ?? undefined} alt={username} />
        <AvatarFallback className="bg-muted text-[0.7rem] font-semibold text-muted-foreground">
          {getProfileFallback(username)}
        </AvatarFallback>
      </Avatar>

      <span className="min-w-0 flex-1 truncate text-sm font-medium">{username}</span>

      <MoreHorizontal
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent-foreground",
          active && "text-accent-foreground",
        )}
        aria-hidden="true"
      />
    </Link>
  );
}
