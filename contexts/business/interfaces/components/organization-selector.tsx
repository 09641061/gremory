"use client";

import { Building2, ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

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

  const filteredOrganizations = organizations.filter((item) =>
    item.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

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
        <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-2 pb-2 text-xs text-muted-foreground">
            <Search className="size-3.5 shrink-0" />
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find organization..."
              aria-label="Find organization"
              className="h-7 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-xs shadow-none focus-visible:border-0 focus-visible:ring-0"
            />
          </div>
          <div className="mt-2 space-y-1">
            {filteredOrganizations.length > 0 ? (
              filteredOrganizations.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  className={`h-auto w-full justify-start rounded-md px-2 py-2 text-left text-sm ${
                    item.id === organization?.id ? "bg-muted font-medium" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Button>
              ))
            ) : (
              <div className="px-2 py-2 text-sm text-muted-foreground">
                No organizations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
