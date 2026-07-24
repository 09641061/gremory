"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2, ChevronDown, Store } from "lucide-react";

export type HeaderOrganization = {
  id: string;
  name: string;
};

export type HeaderEstablishment = {
  id: string;
  name: string;
};

interface HeaderProps {
  organization?: HeaderOrganization;
  establishments: HeaderEstablishment[];
  initialEstablishmentId?: string;
}

export function Header({
  organization,
  establishments,
  initialEstablishmentId,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openMenu, setOpenMenu] = useState<"organization" | "establishment" | null>(null);

  const selectedEstablishmentId =
    searchParams.get("establishmentId") ?? initialEstablishmentId;
  const activeEstablishment = establishments.find(
    (establishment) => establishment.id === selectedEstablishmentId,
  );

  function selectEstablishment(establishmentId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("establishmentId", establishmentId);
    router.push(`${pathname}?${params.toString()}`);
    setOpenMenu(null);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-border/60 bg-background px-6">
      <div className="flex items-center gap-5 text-sm text-foreground">
        <span className="text-base font-semibold text-foreground">Takodu</span>

        <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === "organization" ? null : "organization")}
            className="flex h-9 items-center gap-2 rounded-md px-2 font-medium hover:bg-muted"
          >
            <Building2 className="size-4 text-muted-foreground" />
            <span className="max-w-44 truncate">{organization?.name ?? "Organization"}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {openMenu === "organization" && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
              <div className="border-b border-border px-2 pb-2 text-xs text-muted-foreground">
                Find organization...
              </div>
              <div className="mt-2 rounded-md bg-muted px-2 py-2 text-sm">
                {organization?.name ?? "No organization"}
              </div>
              <div className="px-2 py-2 text-xs text-muted-foreground">All Organizations</div>
              <button
                type="button"
                className="w-full border-t border-border px-2 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                onClick={() => setOpenMenu(null)}
              >
                + New organization
              </button>
            </div>
          )}
        </div>

        <span className="text-muted-foreground">/</span>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === "establishment" ? null : "establishment")}
            className="flex h-9 items-center gap-2 rounded-md px-2 font-medium hover:bg-muted"
          >
            <Store className="size-4 text-muted-foreground" />
            <span className="max-w-44 truncate">
              {activeEstablishment?.name ?? "Select establishment"}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>

          {openMenu === "establishment" && (
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
