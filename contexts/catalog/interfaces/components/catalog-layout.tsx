"use client";

import { useState } from "react";
import { CategorySidebar, type CategoryDTO, type ServiceSummaryDTO } from "./category-sidebar";
import { ServiceDetailView, type DetailedServiceDTO } from "./service-detail-view";
import { CreateCategoryModal } from "./create-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import {
  EstablishmentSelectorBar,
  type OrganizationOption,
} from "@/contexts/business/interfaces/components/establishment-selector-bar";
import { updateCatalogServiceAction } from "../actions/manage-catalog-service.actions";

interface CatalogLayoutProps {
  categories: CategoryDTO[];
  services: DetailedServiceDTO[];
  organizations?: OrganizationOption[];
  activeEstablishmentId?: string;
  onSelectEstablishment?: (establishmentId: string) => void;
}

export function CatalogLayout({
  categories,
  services: initialServices,
  organizations = [],
  activeEstablishmentId,
  onSelectEstablishment,
}: CatalogLayoutProps) {
  const [servicesList, setServicesList] = useState<DetailedServiceDTO[]>(initialServices);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    categories[0]?.id
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(
    initialServices[0]?.id
  );

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  const selectedService = servicesList.find((s) => s.id === selectedServiceId) ?? servicesList[0];

  const serviceSummaries: ServiceSummaryDTO[] = servicesList.map((s) => ({
    id: s.id,
    name: s.name,
    categoryId: s.categoryId ?? categories[0]?.id,
  }));

  const handleMoveServiceCategory = async (serviceId: string, newCategoryId: string) => {
    setServicesList((prev) =>
      prev.map((svc) => (svc.id === serviceId ? { ...svc, categoryId: newCategoryId } : svc))
    );

    const targetService = servicesList.find((s) => s.id === serviceId);
    if (!targetService) return;

    const formData = new FormData();
    formData.append("id", targetService.id);
    formData.append("name", targetService.name);
    formData.append("description", targetService.description);
    formData.append("price", String(targetService.price));
    formData.append("durationMinutes", String(targetService.durationMinutes));
    formData.append("preparationMinutes", String(targetService.preparationMinutes));
    formData.append("cleanupMinutes", String(targetService.cleanupMinutes));
    formData.append("categoryId", newCategoryId);

    await updateCatalogServiceAction({ status: "idle", error: null }, formData);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Temporary Establishment Selector Bar */}
      {organizations.length > 0 && onSelectEstablishment && (
        <EstablishmentSelectorBar
          organizations={organizations}
          selectedEstablishmentId={activeEstablishmentId}
          onSelectEstablishment={onSelectEstablishment}
        />
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <CategorySidebar
          categories={categories}
          services={serviceSummaries}
          selectedCategoryId={selectedCategoryId}
          selectedServiceId={selectedServiceId}
          onSelectCategory={(id) => setSelectedCategoryId(id)}
          onSelectService={(id) => setSelectedServiceId(id)}
          onOpenCreateCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenEditCategoryModal={(category) => setEditingCategory(category)}
          onMoveServiceCategory={handleMoveServiceCategory}
        />

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {selectedService ? (
            <ServiceDetailView service={selectedService} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No services available
            </div>
          )}
        </main>

        <CreateCategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          establishmentId={activeEstablishmentId}
        />

        <EditCategoryModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      </div>
    </div>
  );
}
