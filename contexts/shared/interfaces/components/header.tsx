"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { EstablishmentSelector } from "@/contexts/business/interfaces/components/establishment/establishment-selector/establishment-selector";

export type HeaderEstablishment = {
  id: string;
  name: string;
};

interface HeaderProps {
  organizationSlot?: ReactNode;
  establishments: HeaderEstablishment[];
  initialEstablishmentId?: string;
}

export function Header({
  organizationSlot,
  establishments,
  initialEstablishmentId,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedEstablishmentId =
    searchParams.get("establishmentId") ?? initialEstablishmentId;
  function selectEstablishment(establishmentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("establishmentId", establishmentId);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background px-6">
      <div className="flex items-center gap-5 text-sm text-foreground">
        <Link
          href="/chat"
          className="text-base font-semibold text-foreground"
        >
          Takodu
        </Link>

        <div className="flex items-center gap-1">
        <span className="text-muted-foreground">/</span>
        {organizationSlot}

        <span className="text-muted-foreground">/</span>

        <EstablishmentSelector
          establishments={establishments}
          selectedEstablishmentId={selectedEstablishmentId}
          onSelect={selectEstablishment}
          onNew={() => router.push("/establishments/new")}
        />
        </div>
      </div>
    </header>
  );
}
