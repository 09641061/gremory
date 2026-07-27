"use client";

import { ChevronDown, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { SearchableOptions } from "../../searchable-options";
import { useSelectorMenu } from "../../use-selector-menu";

export type EstablishmentSelectorEstablishment = { id: string; name: string };

interface EstablishmentSelectorProps {
  establishments: EstablishmentSelectorEstablishment[];
  selectedEstablishmentId?: string;
  onSelect: (establishmentId: string) => void;
  onNew?: () => void;
}

export function EstablishmentSelector({
  establishments,
  selectedEstablishmentId,
  onSelect,
  onNew,
}: EstablishmentSelectorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectorRef = useRef<HTMLDivElement>(null);
  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  const activeEstablishment = establishments.find(
    (establishment) => establishment.id === selectedEstablishmentId,
  );

  function selectEstablishment(establishment: EstablishmentSelectorEstablishment) {
    onSelect(establishment.id);
    setIsOpen(false);
  }

  return (
    <div ref={selectorRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={() => setIsOpen((open) => !open)}
        className="h-9 gap-2 px-2 font-medium"
      >
        <Store className="size-4 text-muted-foreground" />
        <span className="max-w-44 truncate">
          {activeEstablishment?.name ?? "Select establishment"}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1">
          <SearchableOptions
            options={establishments}
            selectedId={selectedEstablishmentId}
            search={search}
            onSearchChange={setSearch}
            onSelect={selectEstablishment}
            onSelectAll={() => {
              setIsOpen(false);
              router.push("/establishments");
            }}
            allLabel="All Establishments"
            searchPlaceholder="Find establishment..."
            emptyMessage="No establishments found"
            newLabel="New establishment"
            onNew={() => {
              setIsOpen(false);
              if (onNew) {
                onNew();
                return;
              }
              router.push("/establishments/new");
            }}
          />
        </div>
      )}
    </div>
  );
}
