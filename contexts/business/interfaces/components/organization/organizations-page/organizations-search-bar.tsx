import { Search } from "lucide-react";

import { Input } from "@/contexts/shared/interfaces/components/ui/input";

interface OrganizationsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrganizationsSearchBar({ value, onChange }: OrganizationsSearchBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
    </div>
  );
}
