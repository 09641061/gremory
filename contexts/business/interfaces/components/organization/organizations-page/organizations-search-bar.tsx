"use client";

import { EntitySearchBar } from "@/contexts/shared/interfaces/components/entity-search-bar";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

interface OrganizationsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  canCreate?: boolean;
}

export function OrganizationsSearchBar({ value, onChange, canCreate = true }: OrganizationsSearchBarProps) {
  const { t } = useBusinessTranslations();

  return (
    <EntitySearchBar
      value={value}
      onChange={onChange}
      searchPlaceholder={t.organizations.searchPlaceholder}
      createHref="/organizations/new"
      createLabel={t.organizations.createLabel}
      canCreate={canCreate}
    />
  );
}
