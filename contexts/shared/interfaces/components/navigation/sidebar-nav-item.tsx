"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  label,
  isActive = false,
  onClick,
  className,
}: SidebarNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ease-in-out active:scale-95 select-none",
        isActive
          ? "bg-primary/10 text-primary font-semibold shadow-xs dark:bg-primary/20"
          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        className
      )}
    >
      <Icon
        className={cn(
          "size-5 shrink-0 transition-transform group-hover:scale-110",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
        )}
      />
      <span>{label}</span>
    </Link>
  );
}
