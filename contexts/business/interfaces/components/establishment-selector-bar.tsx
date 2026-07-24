"use client";

import { useState } from "react";
import { Building2Icon, StoreIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

export type EstablishmentOption = {
  id: string;
  name: string;
};

export type OrganizationOption = {
  id: string;
  name: string;
  establishments: EstablishmentOption[];
};

interface EstablishmentSelectorBarProps {
  organizations: OrganizationOption[];
  selectedEstablishmentId?: string;
  onSelectEstablishment: (establishmentId: string) => void;
}

export function EstablishmentSelectorBar({
  organizations,
  selectedEstablishmentId,
  onSelectEstablishment,
}: EstablishmentSelectorBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeEstablishment = organizations
    .flatMap((org) => org.establishments)
    .find((est) => est.id === selectedEstablishmentId);

  const activeOrg = organizations.find((org) =>
    org.establishments.some((est) => est.id === selectedEstablishmentId)
  );

  return (
    <div className="relative z-30 bg-muted/60 border-b border-border px-4 py-2 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="bg-amber-500/10 text-amber-600 font-semibold px-2 py-0.5 rounded border border-amber-500/20">
          TEMP UI
        </span>
        <span>Active Scope:</span>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-2 border-border bg-card text-foreground hover:bg-muted font-normal text-xs"
        >
          <Building2Icon className="size-3.5 text-[#00b77a]" />
          <span className="font-semibold">{activeOrg?.name ?? "No Organization"}</span>
          <span className="text-muted-foreground">/</span>
          <StoreIcon className="size-3.5 text-sky-600" />
          <span>{activeEstablishment?.name ?? "Select Establishment"}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground ml-1" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-lg p-2 space-y-2 max-h-60 overflow-y-auto">
            {organizations.length === 0 ? (
              <div className="p-2 text-center text-muted-foreground text-xs">
                No organizations found for this user.
              </div>
            ) : (
              organizations.map((org) => (
                <div key={org.id} className="space-y-1">
                  <div className="px-2 py-1 font-semibold text-muted-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2Icon className="size-3 text-[#00b77a]" />
                    <span>{org.name}</span>
                  </div>
                  {org.establishments.length === 0 ? (
                    <div className="pl-4 text-xs text-muted-foreground italic">
                      No establishments
                    </div>
                  ) : (
                    org.establishments.map((est) => (
                      <button
                        key={est.id}
                        onClick={() => {
                          onSelectEstablishment(est.id);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left pl-6 pr-3 py-1.5 rounded text-xs flex items-center justify-between transition-colors ${
                          selectedEstablishmentId === est.id
                            ? "bg-[#00b77a] text-white font-medium"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="truncate">{est.name}</span>
                        {selectedEstablishmentId === est.id && (
                          <span className="text-[10px] uppercase font-bold">Active</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
