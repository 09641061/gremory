import { EntitySearchBar } from "@/contexts/shared/interfaces/components/entity-search-bar";

interface EstablishmentsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  canCreate?: boolean;
}

export function EstablishmentsSearchBar({ value, onChange, canCreate = true }: EstablishmentsSearchBarProps) {
  return (
    <EntitySearchBar
      value={value}
      onChange={onChange}
      searchPlaceholder="Search establishments"
      createHref="/establishments/new"
      createLabel="Create establishment"
      canCreate={canCreate}
    />
  );
}
