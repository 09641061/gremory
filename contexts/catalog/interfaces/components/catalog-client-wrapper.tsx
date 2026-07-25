"use client";

import { CatalogLayout } from "@/contexts/catalog/interfaces/components/catalog-layout";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/service-detail-view";
import type { CategoryDTO } from "@/contexts/catalog/interfaces/components/category-sidebar";
interface CatalogClientWrapperProps {
  initialEstablishmentId?: string;
  initialCategories: CategoryDTO[];
  initialServices: DetailedServiceDTO[];
}

export function CatalogClientWrapper({
  initialEstablishmentId,
  initialCategories,
  initialServices,
}: CatalogClientWrapperProps) {
  const activeEstablishmentId = initialEstablishmentId;

  // Derive a key from establishment ID, categories size, and services payload to remount layout when catalog changes
  const layoutKey = `${activeEstablishmentId}_cats:${initialCategories.length}_${JSON.stringify(initialServices.map(s => `${s.id}_${s.categoryId}`))}`;

  return (
    <CatalogLayout
      key={layoutKey} // Remounts layout and updates state when establishment, categories list, or services list changes
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
    />
  );
}
