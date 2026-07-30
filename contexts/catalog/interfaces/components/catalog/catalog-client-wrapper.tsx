"use client";

import { CatalogLayout } from "@/contexts/catalog/interfaces/components/catalog/catalog-layout";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/catalog/service-detail-view";
import type { CategoryDTO } from "@/contexts/catalog/interfaces/components/catalog/category-sidebar";
interface CatalogClientWrapperProps {
  initialEstablishmentId?: string;
  initialSelectedServiceId?: string;
  initialCategories: CategoryDTO[];
  initialServices: DetailedServiceDTO[];
}

export function CatalogClientWrapper({
  initialEstablishmentId,
  initialSelectedServiceId,
  initialCategories,
  initialServices,
}: CatalogClientWrapperProps) {
  const activeEstablishmentId = initialEstablishmentId;

  return (
    <CatalogLayout
      key={`${activeEstablishmentId ?? "none"}:${initialSelectedServiceId ?? "none"}`} // Remounts layout when establishment or selected service changes
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
      initialSelectedServiceId={initialSelectedServiceId}
    />
  );
}
