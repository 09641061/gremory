"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface HeaderProps {
  organizationSlot?: ReactNode;
  establishmentSlot?: ReactNode;
  homeHref?: string;
}

export function Header({
  organizationSlot,
  establishmentSlot,
  homeHref = "/chat",
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
    </header>
  );
}
