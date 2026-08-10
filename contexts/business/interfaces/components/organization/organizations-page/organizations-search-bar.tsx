import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";

interface OrganizationsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  canCreate?: boolean;
}

export function OrganizationsSearchBar({ value, onChange, canCreate = false }: OrganizationsSearchBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center shrink-0">
      <label className="relative block w-full flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search organizations"
          aria-label="Search organizations"
          className="pl-9"
        />
      </label>
      {canCreate && (
        <Link
          href="/organizations/new"
          className={buttonVariants({ className: "shrink-0 gap-2 sm:whitespace-nowrap" })}
        >
          <Plus className="size-4" />
          Create organization
        </Link>
      )}
    </div>
  );
}
