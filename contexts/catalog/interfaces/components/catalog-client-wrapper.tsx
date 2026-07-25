"use client";

import { useState } from "react";
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
  const [activeEstablishmentId, setActiveEstablishmentId] = useState<string | undefined>(
    initialEstablishmentId
  );

  const handleSelectEstablishment = (estId: string) => {
    setActiveEstablishmentId(estId);
    // Reload page with selected establishment query param for server re-rendering
    window.location.href = `/catalog?establishmentId=${estId}`;
  };

  return (
    <CatalogLayout
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
      onSelectEstablishment={handleSelectEstablishment}
    />
  );
}
