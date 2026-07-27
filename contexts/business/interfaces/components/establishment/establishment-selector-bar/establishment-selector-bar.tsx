"use client";

import { useRef, useState } from "react";
import { Building2Icon, ChevronDownIcon, StoreIcon } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { useSelectorMenu } from "../../use-selector-menu";

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
  const selectorRef = useRef<HTMLDivElement>(null);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const activeEstablishment = organizations
    .flatMap((organization) => organization.establishments)
    .find((establishment) => establishment.id === selectedEstablishmentId);

  const activeOrganization = organizations.find((organization) =>
    organization.establishments.some(
      (establishment) => establishment.id === selectedEstablishmentId,
    ),
  );

  return (
    <div className="relative z-30 flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="rounded border border-border bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
          TEMP UI
        </span>
        <span>Active Scope:</span>
      </div>

      <div ref={selectorRef} className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((open) => !open)}
          className="h-8 gap-2 border-border bg-card text-xs font-normal text-foreground hover:bg-muted"
        >
          <Building2Icon className="size-3.5 text-primary" />
          <span className="font-semibold">{activeOrganization?.name ?? "No Organization"}</span>
          <span className="text-muted-foreground">/</span>
          <StoreIcon className="size-3.5 text-primary" />
          <span>{activeEstablishment?.name ?? "Select Establishment"}</span>
          <ChevronDownIcon className="ml-1 size-3.5 text-muted-foreground" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full z-40 mt-1 max-h-60 w-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-card p-2 shadow-lg">
            {organizations.length === 0 ? (
              <div className="p-2 text-center text-xs text-muted-foreground">
                No organizations found for this user.
              </div>
            ) : (
              organizations.map((organization) => (
                <div key={organization.id} className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Building2Icon className="size-3 text-primary" />
                    <span>{organization.name}</span>
                  </div>
                  {organization.establishments.length === 0 ? (
                    <div className="pl-4 text-xs italic text-muted-foreground">
                      No establishments
                    </div>
                  ) : (
                    organization.establishments.map((establishment) => (
                      <Button
                        key={establishment.id}
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          onSelectEstablishment(establishment.id);
                          setIsOpen(false);
                        }}
                        className={`h-auto w-full justify-between rounded-md py-1.5 pl-6 pr-3 text-left text-xs ${
                          selectedEstablishmentId === establishment.id
                            ? "bg-primary font-medium text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        <span className="truncate">{establishment.name}</span>
                        {selectedEstablishmentId === establishment.id && (
                          <span className="text-[10px] font-bold uppercase">Active</span>
                        )}
                      </Button>
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
