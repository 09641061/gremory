"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Store } from "lucide-react";
import type { ReactNode } from "react";

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
  const [isEstablishmentMenuOpen, setIsEstablishmentMenuOpen] = useState(false);

  const selectedEstablishmentId =
    searchParams.get("establishmentId") ?? initialEstablishmentId;
  const activeEstablishment = establishments.find(
    (establishment) => establishment.id === selectedEstablishmentId,
  );

  function selectEstablishment(establishmentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("establishmentId", establishmentId);
    router.push(`${pathname}?${params.toString()}`);
    setIsEstablishmentMenuOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background px-6">
      <div className="flex items-center gap-5 text-sm text-foreground">
        <span className="text-muted-foreground">/</span>
        <span className="text-base font-semibold text-foreground">Takodu</span>

        <div className="flex items-center gap-1">
        {organizationSlot}

        <span className="text-muted-foreground">/</span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEstablishmentMenuOpen((open) => !open)}
            className="flex h-9 items-center gap-2 rounded-md px-2 font-medium hover:bg-muted"
          >
            <Store className="size-4 text-muted-foreground" />
            <span className="max-w-44 truncate">
              {activeEstablishment?.name ?? "Select establishment"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {isEstablishmentMenuOpen && (
            <div className="absolute left-0 top-full mt-1 max-h-64 w-64 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
              {establishments.length > 0 ? (
                establishments.map((establishment) => (
                  <button
                    key={establishment.id}
                    type="button"
                    onClick={() => selectEstablishment(establishment.id)}
                    className={`w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted ${
                      establishment.id === selectedEstablishmentId ? "bg-muted font-medium" : ""
                    }`}
                  >
                    {establishment.name}
                  </button>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">No establishments</div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </header>
  );
}
