"use client";

import { useState } from "react";
import { CatalogLayout } from "@/contexts/catalog/interfaces/components/catalog-layout";
import type { DetailedServiceDTO } from "@/contexts/catalog/interfaces/components/service-detail-view";
import type { CategoryDTO } from "@/contexts/catalog/interfaces/components/category-sidebar";
import type { OrganizationOption } from "@/contexts/business/interfaces/components/establishment-selector-bar";

interface CatalogClientWrapperProps {
  initialEstablishmentId?: string;
  organizations: OrganizationOption[];
  initialCategories: CategoryDTO[];
  initialServices: DetailedServiceDTO[];
}

export function CatalogClientWrapper({
  initialEstablishmentId,
  organizations,
  initialCategories,
  initialServices,
}: CatalogClientWrapperProps) {
  const [activeEstablishmentId, setActiveEstablishmentId] = useState<string | undefined>(
    initialEstablishmentId
  );
  const [categories] = useState<CategoryDTO[]>(initialCategories);
  const [services] = useState<DetailedServiceDTO[]>(initialServices);

  const handleSelectEstablishment = (estId: string) => {
    setActiveEstablishmentId(estId);
    // Reload page with selected establishment query param for server re-rendering
    window.location.href = `/catalog?establishmentId=${estId}`;
  };

  return (
    <CatalogLayout
      categories={categories}
      services={services}
      organizations={organizations}
      activeEstablishmentId={activeEstablishmentId}
      onSelectEstablishment={handleSelectEstablishment}
    />
  );
}
