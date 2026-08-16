"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CategorySidebar, type CategoryDTO, type ServiceSummaryDTO } from "./category-sidebar";
import { type DetailedServiceDTO } from "./service-detail-view";
import { EditServiceForm } from "./edit-service-form";
import { CreateCategoryModal } from "./create-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { CreateServiceForm } from "../create-service/create-service-form";
import { updateCatalogServiceAction } from "../../actions/manage-catalog-service.actions";

interface CatalogLayoutProps {
  categories: CategoryDTO[];
  services: DetailedServiceDTO[];
  activeEstablishmentId?: string;
  initialSelectedServiceId?: string;
  canCreateCategory: boolean;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export function CatalogLayout({
  categories,
  services: initialServices,
  activeEstablishmentId,
  initialSelectedServiceId,
  canCreateCategory,
  canUpdateCategory,
  canDeleteCategory,
  canCreateService,
  canUpdateService,
  canDeleteService,
}: CatalogLayoutProps) {
  const router = useRouter();
  const selectedCategoryIdFallback = categories[0]?.id;
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(selectedCategoryIdFallback);
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(initialSelectedServiceId);
  const [createdService, setCreatedService] = useState<DetailedServiceDTO | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [creatingServiceCategoryId, setCreatingServiceCategoryId] = useState<string | undefined>(undefined);
  const [serviceOverrides, setServiceOverrides] = useState<Record<string, Partial<DetailedServiceDTO>>>({});
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  // `createdService` is a bridge, not a second source of truth: it holds the new
  // row on screen for the moment between the create action returning and the
  // refreshed server list arriving. Whoever removes the service is the one that
  // releases it — see `onDeleted` below — because from here an absence from the
  // server list is indistinguishable from a refresh still in flight.
  const servicesList = useMemo(
    () => {
      const services = [...initialServices];
      if (createdService && !services.some((service) => service.id === createdService.id)) {
        services.unshift(createdService);
      }

      return services.map((service) => ({
        ...service,
        ...serviceOverrides[service.id],
      }));
    },
    [createdService, initialServices, serviceOverrides]
  );

  const activeSelectedCategoryId =
    selectedServiceId
      ? undefined
      : selectedCategoryId && categories.some((category) => category.id === selectedCategoryId)
      ? selectedCategoryId
      : selectedCategoryIdFallback;

  const selectedService = selectedServiceId ? servicesList.find((s) => s.id === selectedServiceId) : undefined;

  const serviceSummaries: ServiceSummaryDTO[] = servicesList.map((s) => ({
    id: s.id,
    name: s.name,
    categoryId: s.categoryId ?? null,
  }));

  const handleMoveServiceCategory = async (serviceId: string, newCategoryId: string | null) => {
    const targetService = servicesList.find((s) => s.id === serviceId);
    if (!targetService) return;
    if ((targetService.categoryId ?? null) === newCategoryId) return;

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
    // An empty value clears the category server-side (the action maps "" to undefined)
    formData.append("categoryId", newCategoryId ?? "");

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
    <div className="flex h-full min-h-0 flex-1 w-full flex-col bg-background">
      <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <CategorySidebar
          categories={categories}
          services={serviceSummaries}
          selectedCategoryId={activeSelectedCategoryId}
          selectedServiceId={selectedServiceId}
          onSelectCategory={(id) => {
            setSelectedCategoryId(id);
            setSelectedServiceId(undefined);
            setIsCreatingService(false);
            setCreatingServiceCategoryId(undefined);
          }}
          onSelectService={(id) => {
            setSelectedServiceId(id);
            setSelectedCategoryId(undefined);
            setIsCreatingService(false);
            setCreatingServiceCategoryId(undefined);
          }}
          onOpenCreateCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenEditCategoryModal={(category) => setEditingCategory(category)}
          onMoveServiceCategory={handleMoveServiceCategory}
          onCreateService={(catId) => {
            setIsCreatingService(true);
            setCreatingServiceCategoryId(catId);
            setSelectedServiceId(undefined);
            setSelectedCategoryId(catId);
          }}
          canCreateCategory={canCreateCategory}
          canUpdateCategory={canUpdateCategory}
          canDeleteCategory={canDeleteCategory}
          canCreateService={canCreateService}
        />

        <main className="min-h-0 flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {isCreatingService ? (
            <CreateServiceForm
              key={`create-service-${creatingServiceCategoryId ?? "uncategorized"}`}
              establishmentId={activeEstablishmentId ?? ""}
              categoryId={creatingServiceCategoryId}
              onSuccess={(service) => {
                setCreatedService(service);
                setSelectedServiceId(service.id);
                setSelectedCategoryId(undefined);
                setIsCreatingService(false);
                setCreatingServiceCategoryId(undefined);
                // Nothing else asks the server for the list again after a
                // create, so without this the bridge above would be the only
                // place the new service ever existed.
                router.refresh();
              }}
              onCancel={() => {
                setIsCreatingService(false);
                setCreatingServiceCategoryId(undefined);
              }}
            />
          ) : selectedService ? (
            <EditServiceForm
              service={selectedService}
              onCancel={() => {
                setSelectedServiceId(undefined);
              }}
              onDeleted={() => {
                setSelectedServiceId(undefined);
                // The service just created is held here until the refreshed
                // server list carries it. Deleting it makes that list right to
                // omit it, so the hold has to be released or `servicesList`
                // would read the absence as a refresh still in flight and put
                // the deleted row back in the sidebar.
                setCreatedService((created) =>
                  created?.id === selectedService.id ? null : created,
                );
                setServiceOverrides((previous) => {
                  const next = { ...previous };
                  delete next[selectedService.id];
                  return next;
                });
              }}
              canUpdateService={canUpdateService}
              canDeleteService={canDeleteService}
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
