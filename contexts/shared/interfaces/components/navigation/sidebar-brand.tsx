import React from "react";
import Link from "next/link";

interface SidebarBrandProps {
  className?: string;
}

/**
 * SidebarBrand component displaying the Takodu brand title and emblem.
 */
export function SidebarBrand({ className = "" }: SidebarBrandProps) {
  return (
    <div className={`flex items-center gap-3 px-2 ${className}`}>
      <Link href="/dashboard" className="group flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-lg shadow-xs transition-transform group-hover:scale-105">
          T
        </div>
        <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
          Takodu
        </span>
      </Link>
    </div>
  );
}
