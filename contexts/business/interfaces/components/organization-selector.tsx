"use client";

import { Building2, ChevronDown } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { SearchableOptions } from "./searchable-options";
import { useSelectorMenu } from "./use-selector-menu";

export type OrganizationSelectorOrganization = {
  id: string;
  name: string;
};

interface OrganizationSelectorProps {
  organization?: OrganizationSelectorOrganization;
  organizations?: OrganizationSelectorOrganization[];
}

export function OrganizationSelector({
  organization,
  organizations = organization ? [organization] : [],
}: OrganizationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectorRef = useRef<HTMLDivElement>(null);

  useSelectorMenu(isOpen, setIsOpen, selectorRef);

  return (
    <div ref={selectorRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="lg"
        onClick={() => setIsOpen((open) => !open)}
        className="h-9 gap-2 px-2 font-medium"
      >
        <Building2 className="size-4 text-muted-foreground" />
        <span className="max-w-44 truncate">{organization?.name ?? "Organization"}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1">
          <SearchableOptions
            options={organizations}
            selectedId={organization?.id}
            search={search}
            onSearchChange={setSearch}
            onSelect={() => setIsOpen(false)}
            onSelectAll={() => setIsOpen(false)}
            allLabel="All Organizations"
            searchPlaceholder="Find organization..."
            emptyMessage="No organizations found"
            newLabel="New organization"
            onNew={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
