"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";

export type HeaderEstablishment = {
  id: string;
  name: string;
};

interface HeaderProps {
  organizationSlot?: ReactNode;
  establishments: ReadonlyArray<HeaderEstablishment>;
  initialEstablishmentId?: string;
  homeHref?: string;
  onSelectEstablishment?: (establishmentId: string) => void;
  onSelectAllEstablishments?: () => void;
  onNewEstablishment?: () => void;
}

export function Header({
  organizationSlot,
  establishments,
  initialEstablishmentId,
  homeHref = "/chat",
  onSelectEstablishment = () => {},
  onSelectAllEstablishments = () => {},
  onNewEstablishment = () => {},
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

          <EstablishmentSelector
            establishments={establishments}
            selectedEstablishmentId={initialEstablishmentId}
            onSelect={onSelectEstablishment}
            onSelectAll={onSelectAllEstablishments}
            onNew={onNewEstablishment}
          />
        </div>
      </div>
    </header>
  );
}
