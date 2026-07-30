"use client";

import { ChevronDown, Store } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { SearchableOptions } from "../../searchable-options";
import { useSelectorMenu } from "../../use-selector-menu";

export type EstablishmentSelectorEstablishment = { id: string; name: string; photoUrl?: string | null };

interface EstablishmentSelectorProps {
  establishments: EstablishmentSelectorEstablishment[];
  selectedEstablishmentId?: string;
  onSelect: (establishmentId: string) => void;
  onNew?: () => void;
  canRead?: boolean;
}

export function EstablishmentSelector({
  establishments,
  selectedEstablishmentId,
  onSelect,
  onNew,
  canRead = true,
}: EstablishmentSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
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
        <Avatar className="size-5 border border-border">
          {activeEstablishment?.photoUrl ? (
            <AvatarImage src={activeEstablishment.photoUrl} alt={activeEstablishment.name} />
          ) : (
            <AvatarFallback className="bg-muted">
              <Store className="size-3 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
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
              if (canRead) {
                const query = selectedEstablishmentId ? `?establishmentId=${selectedEstablishmentId}` : "";
                router.push(`/establishments${query}`);
              } else {
                router.push(`${pathname}?denied=est`);
              }
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
