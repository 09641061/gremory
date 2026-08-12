"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  organizationSlot?: ReactNode;
  establishmentSlot?: ReactNode;
  homeHref?: string;
  planId?: number;
}

export function Header({
  organizationSlot,
  establishmentSlot,
  homeHref = "/chat",
  planId,
}: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background px-6">
      <div className="flex items-center gap-5 text-sm text-foreground">
        <Link href={homeHref} className="text-base font-semibold text-foreground">
          Takodu
        </Link>

        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">/</span>
          {organizationSlot}

          <span className="text-muted-foreground">/</span>
          {establishmentSlot}
        </div>
      </div>

      {planId === 0 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center gap-1.5 rounded-full bg-card border border-border/50 py-1.5 px-3.5 text-xs font-medium text-muted-foreground shadow-xs">
          <span>Free plan</span>
          <span className="text-muted-foreground/30">•</span>
          <Link
            href="/upgrade"
            className="font-semibold text-foreground underline decoration-muted-foreground/60 underline-offset-2 hover:decoration-foreground transition-all"
          >
            Upgrade
          </Link>
        </div>
      )}
    </header>
  );
}
