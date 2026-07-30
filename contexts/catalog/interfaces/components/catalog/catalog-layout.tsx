"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategorySidebar, type CategoryDTO, type ServiceSummaryDTO } from "./category-sidebar";
import { type DetailedServiceDTO } from "./service-detail-view";
import { EditServiceForm } from "./edit-service-form";
import { CreateCategoryModal } from "./create-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { CreateServiceForm } from "../new/create-service-form";
import { updateCatalogServiceAction } from "../../actions/manage-catalog-service.actions";

interface CatalogLayoutProps {
  categories: CategoryDTO[];
  services: DetailedServiceDTO[];
  activeEstablishmentId?: string;
}

export function CatalogLayout({
  categories,
  services: initialServices,
  activeEstablishmentId,
}: CatalogLayoutProps) {
  const router = useRouter();
  const selectedCategoryIdFallback = categories[0]?.id;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(selectedCategoryIdFallback);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);
  const [creatingServiceCategoryId, setCreatingServiceCategoryId] = useState<string | undefined>(undefined);
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, Partial<DetailedServiceDTO>>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  const servicesList = useMemo(
    () =>
      initialServices.map((service) => ({
        ...service,
        ...serviceOverrides[service.id],
      })),
    [initialServices, serviceOverrides]
  );

  const activeSelectedCategoryId =
    selectedCategoryId && categories.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : selectedCategoryIdFallback;

  const selectedService = selectedServiceId ? servicesList.find((s) => s.id === selectedServiceId) : undefined;

  const serviceSummaries: ServiceSummaryDTO[] = servicesList.map((s) => ({
    id: s.id,
    name: s.name,
    categoryId: s.categoryId ?? categories[0]?.id,
  }));

  const handleMoveServiceCategory = async (serviceId: string, newCategoryId: string) => {
    const targetService = servicesList.find((s) => s.id === serviceId);
    if (!targetService) return;

    setServiceOverrides((prev) => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        categoryId: newCategoryId,
      },
    }));

    const formData = new FormData();
    formData.append("id", targetService.id);
    formData.append("name", targetService.name);
    formData.append("description", targetService.description);
    formData.append("price", String(targetService.price));
    formData.append("durationMinutes", String(targetService.durationMinutes));
    formData.append("preparationMinutes", String(targetService.preparationMinutes));
    formData.append("cleanupMinutes", String(targetService.cleanupMinutes));
    formData.append("categoryId", newCategoryId);

    const result = await updateCatalogServiceAction({ status: "idle", error: null }, formData);
    if (result.status !== "success") {
      setServiceOverrides((prev) => {
        const next = { ...prev };
        delete next[serviceId];
        return next;
      });
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full overflow-hidden bg-background">
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden h-full">
        <CategorySidebar
          categories={categories}
          services={serviceSummaries}
          selectedCategoryId={activeSelectedCategoryId}
          selectedServiceId={selectedServiceId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setSelectedServiceId(undefined);
            setCreatingServiceCategoryId(undefined);
          }}
          onSelectService={(id) => {
            setSelectedServiceId(id);
            setSelectedCategoryId(undefined);
            setCreatingServiceCategoryId(undefined);
          }}
          onOpenCreateCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenEditCategoryModal={(category) => setEditingCategory(category)}
          onMoveServiceCategory={handleMoveServiceCategory}
          onCreateService={(catId) => {
            setCreatingServiceCategoryId(catId);
            setSelectedServiceId(undefined);
            setSelectedCategoryId(undefined);
          }}
        />

        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {creatingServiceCategoryId ? (
            <CreateServiceForm
              key={`create-service-${creatingServiceCategoryId}`}
              establishmentId={activeEstablishmentId ?? ""}
              categoryId={creatingServiceCategoryId}
              onSuccess={() => {
                setCreatingServiceCategoryId(undefined);
                router.refresh();
              }}
              onCancel={() => {
                setCreatingServiceCategoryId(undefined);
              }}
            />
          ) : selectedService ? (
            <EditServiceForm
              service={selectedService}
              onCancel={() => {
                setSelectedServiceId(undefined);
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a service from the sidebar to view or edit its settings.
            </div>
          )}
        </main>

        {isCategoryModalOpen && (
          <CreateCategoryModal
            isOpen={isCategoryModalOpen}
            onClose={() => setIsCategoryModalOpen(false)}
            establishmentId={activeEstablishmentId}
          />
        )}

        {editingCategory && (
          <EditCategoryModal
            isOpen={!!editingCategory}
            onClose={() => setEditingCategory(null)}
            category={editingCategory}
          />
        )}
      </div>
    </div>
  );
}
