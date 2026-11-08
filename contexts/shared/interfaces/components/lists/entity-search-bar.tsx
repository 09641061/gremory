import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

interface EntitySearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Placeholder and aria-label for the search input, e.g. "Search organizations". */
  searchPlaceholder: string;
  /** Route the "create" link points to, e.g. "/organizations/new". */
  createHref: string;
  /** Label for the "create" link, e.g. "New organization". */
  createLabel: string;
  canCreate?: boolean;
}

/**
 * Shared search bar for entity list pages (organizations, establishments):
 * a search input plus an optional "create new" link. Parameterized by
 * placeholder/create link/label so each entity page supplies only its copy
 * and routing, not its own layout.
 */
export function EntitySearchBar({
  value,
  onChange,
  searchPlaceholder,
  createHref,
  createLabel,
  canCreate = true,
}: EntitySearchBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
      <label className="relative block w-full flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </label>
      {canCreate && (
        <Link
          href={createHref}
          className={buttonVariants({ className: "shrink-0 gap-2 sm:whitespace-nowrap" })}
        >
          <Plus className="size-4" />
          {createLabel}
        </Link>
      )}
    </div>
  );
}
