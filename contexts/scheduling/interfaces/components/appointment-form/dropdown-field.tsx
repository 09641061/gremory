"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/contexts/shared/interfaces/components/ui/select";
import type { DropdownOption } from "./types";

interface DropdownFieldProps {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  emptyMessage?: string;
}

/**
 * Single-choice field backed by the shared `Select` primitive.
 *
 * Delegating to the primitive is what buys arrow-key navigation, type-ahead,
 * correct `listbox`/`option` semantics and the hidden input that carries the
 * value to the Server Action — none of which a hand-rolled popup provided.
 */
export function DropdownField({
  id,
  name,
  placeholder,
  value,
  options,
  onChange,
  emptyMessage = "No options available",
}: DropdownFieldProps) {
  // Lets `SelectValue` resolve the trigger label without re-rendering option rows.
  const items = useMemo(
    () => options.map((option) => ({ value: option.value, label: option.label })),
    [options]
  );

  return (
    <Select
      name={name}
      items={items}
      value={value || null}
      onValueChange={(next: string | null) => onChange(next ?? "")}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">{emptyMessage}</div>
        ) : (
          options.map((option) => (
            <SelectItem key={option.value} value={option.value} label={option.label}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{option.label}</span>
                {option.description && (
                  <span className="truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
