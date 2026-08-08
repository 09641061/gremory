"use client";

import { Building2, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import { SearchableOptions } from "@/contexts/shared/interfaces/components/searchable-options";
import { useSelectorMenu } from "../../use-selector-menu";

export type OrganizationSelectorOrganization = {
  id: string;
  name: string;
  imageUrl?: string | null;
};

interface OrganizationSelectorProps {
  organization?: OrganizationSelectorOrganization;
  organizations?: OrganizationSelectorOrganization[];
  canRead?: boolean;
  onSelect?: (organizationId: string) => void;
  activeEstablishmentId?: string;
}

export function OrganizationSelector({
  organization,
  organizations = organization ? [organization] : [],
  canRead = true,
  onSelect,
  activeEstablishmentId,
}: OrganizationSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
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
        <Avatar className="size-5 border border-border">
          {organization?.imageUrl ? (
            <AvatarImage src={organization.imageUrl} alt={organization.name} />
          ) : (
            <AvatarFallback className="bg-muted">
              <Building2 className="size-3 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
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
            onSelect={(org) => {
              setIsOpen(false);
              onSelect?.(org.id);
            }}
            onSelectAll={() => {
              setIsOpen(false);
              if (canRead) {
                const query = activeEstablishmentId ? `?establishmentId=${activeEstablishmentId}` : "";
                router.push(`/organizations${query}`);
              } else {
                router.push(`${pathname}?denied=org`);
              }
            }}
            allLabel="All Organizations"
            searchPlaceholder="Find organization..."
            emptyMessage="No organizations found"
          />
        </div>
      )}
    </div>
  );
}
