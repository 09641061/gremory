import { EntitySearchBar } from "@/contexts/shared/interfaces/components/entity-search-bar";

interface OrganizationsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  canCreate?: boolean;
}

export function OrganizationsSearchBar({ value, onChange, canCreate = true }: OrganizationsSearchBarProps) {
  return (
    <EntitySearchBar
      value={value}
      onChange={onChange}
      searchPlaceholder="Search organizations"
      createHref="/organizations/new"
      createLabel="New organization"
      canCreate={canCreate}
    />
  );
}
