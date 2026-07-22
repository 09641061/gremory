"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CircleHelp, LogOut, Loader2 } from "lucide-react";
import { SidebarNavItem } from "./sidebar-nav-item";
import { signOutAction } from "@/contexts/iam/interfaces/actions/sign-out.action";
import { cn } from "@/lib/utils";

interface SidebarFooterProps {
  currentPathname?: string;
  isCollapsed?: boolean;
  onItemClick?: () => void;
  className?: string;
}

/**
 * SidebarFooter component containing help center and sign-out controls with collapsed mode support.
 */
export function SidebarFooter({
  currentPathname,
  isCollapsed = false,
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
        isCollapsed={isCollapsed}
        onClick={onItemClick}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        title={isCollapsed ? "Sign Out" : undefined}
        className={cn(
          "group flex w-full items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-medium text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150 ease-in-out active:scale-95 disabled:opacity-50 select-none cursor-pointer",
          isCollapsed ? "justify-center px-2" : "justify-start"
        )}
      >
        {isPending ? (
          <Loader2 className="size-5 shrink-0 animate-spin text-destructive" />
        ) : (
          <LogOut className="size-5 shrink-0 transition-transform group-hover:scale-110 group-hover:text-destructive" />
        )}
        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">Sign Out</span>}
      </button>
    </div>
  );
}
