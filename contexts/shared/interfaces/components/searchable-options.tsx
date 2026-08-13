"use client";

import { useState, type ReactNode } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/contexts/shared/interfaces/components/ui/combobox";

export type SearchableOption = { id: string; name: string };

interface SearchableOptionsProps<T extends SearchableOption> {
  options: ReadonlyArray<T>;
  selectedId?: string;
  onSelect: (option: T) => void;
  onSelectAll?: () => void;
  allLabel: string;
  searchPlaceholder: string;
  emptyMessage: string;
  newLabel?: string;
  onNew?: () => void;
  /** Contents of the trigger button. */
  children: ReactNode;
  triggerClassName?: string;
  /** Extra entries rendered below the list, after the actions. */
  footer?: ReactNode;
}

export function SearchableOptions<T extends SearchableOption>({
  options,
  selectedId,
  onSelect,
  onSelectAll,
  allLabel,
  searchPlaceholder,
  emptyMessage,
  newLabel,
  onNew,
  children,
  triggerClassName,
  footer,
}: SearchableOptionsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.id === selectedId) ?? null;

  function runAndClose(action: () => void) {
    setIsOpen(false);
    action();
  }

  return (
    <Combobox<T>
      items={options as T[]}
      value={selectedOption}
      itemToStringLabel={(option) => option.name}
      isItemEqualToValue={(option, value) => option.id === value.id}
      open={isOpen}
      onOpenChange={setIsOpen}
      onValueChange={(option) => {
        if (option) {
          onSelect(option);
        }
      }}
    >
      <ComboboxTrigger
        render={<Button type="button" variant="ghost" className={triggerClassName} />}
        aria-label={selectedOption?.name ?? allLabel}
        indicator={<ChevronsUpDown className="pointer-events-none size-4 text-muted-foreground" />}
      >
        {children}
      </ComboboxTrigger>

      <ComboboxContent className="w-64 min-w-64">
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxEmpty className="px-2 py-2 text-left">{emptyMessage}</ComboboxEmpty>
        <ComboboxList className="max-h-48">
          {(option: T) => (
            <ComboboxItem key={option.id} value={option}>
              {option.name}
            </ComboboxItem>
          )}
        </ComboboxList>

        {(onSelectAll || (newLabel && onNew) || footer) && <ComboboxSeparator />}

        {onSelectAll && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => runAndClose(onSelectAll)}
            className="h-8 w-full justify-start px-2 text-sm font-normal text-muted-foreground"
          >
            {allLabel}
          </Button>
        )}

        {newLabel && onNew && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => runAndClose(onNew)}
            className="h-8 w-full justify-start gap-2 px-2 text-sm font-normal text-muted-foreground"
          >
            <Plus className="size-4" />
            {newLabel}
          </Button>
        )}

        {footer}
      </ComboboxContent>
    </Combobox>
  );
}
