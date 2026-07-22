import React from "react";
import Link from "next/link";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarBrandProps {
  isCollapsed?: boolean;
  onExpand?: () => void;
  className?: string;
}

/**
 * SidebarBrand component displaying the Takodu brand title and emblem.
 * When collapsed, hovering over the brand emblem smoothly transitions to the expand button.
 */
export function SidebarBrand({
  isCollapsed = false,
  onExpand,
  className = "",
}: SidebarBrandProps) {
  if (isCollapsed) {
    return (
      <div className={cn("flex items-center justify-center w-full", className)}>
        <button
          type="button"
          onClick={onExpand}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="group/brand relative flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {/* Emblem 'T' displayed by default, fades out on hover */}
          <span className="transition-opacity duration-200 group-hover/brand:opacity-0">
            T
          </span>
          {/* Expand icon hidden by default, fades in on hover */}
          <PanelLeftOpen className="absolute size-5 opacity-0 transition-opacity duration-200 group-hover/brand:opacity-100 text-primary-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 px-1 transition-all duration-200", className)}>
      <Link href="/dashboard" title="Takodu" className="group flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-xs transition-transform group-hover:scale-105 shrink-0">
          T
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors whitespace-nowrap overflow-hidden">
          Takodu
        </span>
      </Link>
    </div>
  );
}
