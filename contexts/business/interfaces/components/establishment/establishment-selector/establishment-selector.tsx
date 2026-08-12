"use client";

import { Store } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";

export type EstablishmentSelectorEstablishment = { id: string; name: string; photoUrl?: string | null };

interface EstablishmentSelectorProps {
  establishments: ReadonlyArray<EstablishmentSelectorEstablishment>;
  selectedEstablishmentId?: string;
  onSelect: (establishmentId: string) => void;
  onSelectAll?: () => void;
  onNew?: () => void;
}

export function EstablishmentSelector({
  establishments,
  selectedEstablishmentId,
  onSelect,
  onSelectAll,
  onNew,
}: EstablishmentSelectorProps) {
  const activeEstablishment = establishments.find(
    (establishment) => establishment.id === selectedEstablishmentId,
  );

  return (
    <SearchableOptions
      options={establishments}
      selectedId={selectedEstablishmentId}
      onSelect={(establishment) => onSelect(establishment.id)}
      onSelectAll={onSelectAll}
      allLabel="All Establishments"
      searchPlaceholder="Find establishment..."
      emptyMessage="No establishments found"
      newLabel="New establishment"
      onNew={onNew}
      triggerClassName="gap-2 px-2 font-medium"
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
    </SearchableOptions>
  );
}
