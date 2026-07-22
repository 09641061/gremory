"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp, LogOut, Loader2 } from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";
import { signOutAction } from "@/contexts/iam/interfaces/actions/sign-out.action";

interface SidebarFooterProps {
  currentPathname?: string;
  onItemClick?: () => void;
  className?: string;
}

export function SidebarFooter({
  currentPathname,
  onItemClick,
  className = "",
}: SidebarFooterProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.status === "success") {
        router.replace("/login");
      }
    });
  };

  return (
    <div className={`mt-auto pt-4 border-t border-border flex flex-col gap-1 ${className}`}>
      <SidebarNavItem
        href="/help"
        icon={CircleHelp}
        label="Help Center"
        isActive={currentPathname === "/help"}
        onClick={onItemClick}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        className="group flex w-full items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-medium text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 ease-in-out active:scale-95 disabled:opacity-50 select-none cursor-pointer"
      >
        {isPending ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-destructive" />
        ) : (
          <LogOut className="size-5 shrink-0 transition-transform group-hover:scale-110 group-hover:text-destructive" />
        )}
        <span>Sign Out</span>
      </button>
    </div>
  );
}
