"use client";

import { CatalogLayout } from "@/contexts/catalog/interfaces/components/catalog/catalog-layout";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
interface CatalogClientWrapperProps {
  currency?: "USD" | "PEN";
  initialEstablishmentId?: string;
  initialSelectedServiceId?: string;
  initialCategories: CategoryDTO[];
  initialServices: DetailedServiceDTO[];
  canCreateCategory: boolean;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export function CatalogClientWrapper({
  currency = "USD",
  initialEstablishmentId,
  initialSelectedServiceId,
  initialCategories,
  initialServices,
  canCreateCategory,
  canUpdateCategory,
  canDeleteCategory,
  canCreateService,
  canUpdateService,
  canDeleteService,
}: CatalogClientWrapperProps) {
  const activeEstablishmentId = initialEstablishmentId;

  return (
    <CatalogLayout
      // Only the establishment belongs in the key. It is a different catalog,
      // so every piece of local state below is stale and the remount is the
      // point. The selected service is client state that the layout seeds from
      // this prop; keying on it too meant selecting a service threw away the
      // expanded categories and the pending edits along with it.
      key={activeEstablishmentId ?? "none"}
      currency={currency}
      categories={initialCategories}
      services={initialServices}
      activeEstablishmentId={activeEstablishmentId}
      initialSelectedServiceId={initialSelectedServiceId}
      canCreateCategory={canCreateCategory}
      canUpdateCategory={canUpdateCategory}
      canDeleteCategory={canDeleteCategory}
      canCreateService={canCreateService}
      canUpdateService={canUpdateService}
      canDeleteService={canDeleteService}
    />
  );
}
