"use client";

import { Plus, Search } from "lucide-react";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

export type SearchableOption = { id: string; name: string };

interface SearchableOptionsProps<T extends SearchableOption> {
  options: ReadonlyArray<T>;
  selectedId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (option: T) => void;
  onSelectAll?: () => void;
  allLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  newLabel?: string;
  onNew?: () => void;
}

export function SearchableOptions<T extends SearchableOption>({
  options,
  selectedId,
  search,
  onSearchChange,
  onSelect,
  onSelectAll,
  allLabel,
  searchPlaceholder,
  emptyMessage,
  newLabel,
  onNew,
}: SearchableOptionsProps<T>) {
  const normalizedSearch = search.trim().toLowerCase();
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(normalizedSearch),
  );

  return (
    <div className="w-64 rounded-lg border border-border bg-card p-2 shadow-lg">
      <div className="flex items-center gap-2 border-b border-border px-2 pb-2 text-xs text-muted-foreground">
        <Search className="size-3.5 shrink-0" />
        <Input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="h-7 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-xs shadow-none focus-visible:border-0 focus-visible:ring-0"
        />
      </div>

      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              onClick={() => onSelect(option)}
              className={`h-auto w-full justify-start rounded-md px-2 py-2 text-left text-sm ${
                option.id === selectedId ? "bg-muted font-medium" : ""
              }`}
            >
              {option.name}
            </Button>
          ))
        ) : (
          <div className="px-2 py-2 text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>

      {onSelectAll ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onSelectAll}
          className="mt-1 h-auto w-full justify-start rounded-md px-2 py-2 text-left text-sm text-muted-foreground"
        >
          {allLabel}
        </Button>
      ) : null}

      {newLabel && onNew ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onNew}
          className="mt-1 h-auto w-full justify-start gap-2 rounded-md border-t border-border px-2 py-2 text-left text-sm text-muted-foreground"
        >
          <Plus className="size-4" />
          {newLabel}
        </Button>
      ) : null}
    </div>
  );
}
