"use client";

import { EntitySearchBar } from "@/contexts/shared/interfaces/components/entity-search-bar";
import { useBusinessTranslations } from "@/contexts/business/interfaces/i18n";

interface EstablishmentsSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  canCreate?: boolean;
}

export function EstablishmentsSearchBar({ value, onChange, canCreate = true }: EstablishmentsSearchBarProps) {
  const { t } = useBusinessTranslations();

  return (
    <EntitySearchBar
      value={value}
      onChange={onChange}
      searchPlaceholder={t.establishments.searchPlaceholder}
      createHref="/establishments/new"
      createLabel={t.establishments.createLabel}
      canCreate={canCreate}
    />
  );
}
