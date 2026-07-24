"use client";

import { useState } from "react";
import { CategorySidebar, type CategoryDTO, type ServiceSummaryDTO } from "./category-sidebar";
import { ServiceDetailView, type DetailedServiceDTO } from "./service-detail-view";
import { CreateCategoryModal } from "./create-category-modal";

interface CatalogLayoutProps {
  categories: CategoryDTO[];
  services: DetailedServiceDTO[];
}

export function CatalogLayout({ categories, services }: CatalogLayoutProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(
    services[0]?.id
  );
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];

  const serviceSummaries: ServiceSummaryDTO[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    // Mock category assignment for demo view
    categoryId: categories[0]?.id,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CategorySidebar
        categories={categories}
        services={serviceSummaries}
        selectedCategoryId={selectedCategoryId}
        selectedServiceId={selectedServiceId}
        onSelectCategory={(id) => setSelectedCategoryId(id)}
        onSelectService={(id) => setSelectedServiceId(id)}
        onOpenCreateCategoryModal={() => setIsCategoryModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto bg-background">
        {selectedService ? (
          <ServiceDetailView service={selectedService} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No services available
          </div>
        )}
      </main>

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
