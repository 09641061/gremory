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


  return (
    <CatalogLayout
      key={activeEstablishmentId} // Remounts layout and updates state only when active establishment switches
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
    />
  );
}
