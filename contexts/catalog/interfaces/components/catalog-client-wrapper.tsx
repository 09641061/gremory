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
  // Use initialEstablishmentId directly as key in layout, removing unused setState
  const activeEstablishmentId = initialEstablishmentId;

  return (
    <CatalogLayout
      key={activeEstablishmentId} // Force component remount and state reset on establishment change
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
    />
  );
}
