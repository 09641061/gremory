"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Plus, Search, X } from "lucide-react";
import { Input } from "@/contexts/shared/interfaces/components/ui/input";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/feedback/error";
import { CategoryItem } from "./category-item";
import { CreateCategoryModal } from "./create-category-modal";
import { EditCategoryModal } from "./edit-category-modal";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { CreateServiceForm } from "../create-service/create-service-form";
import { EditServiceForm } from "./edit-service-form";
import { updateCatalogServiceAction } from "../../actions/manage-catalog-service.actions";
import { reorderCatalogCategoriesAction } from "../../actions/manage-service-category.actions";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { useCatalogTranslations } from "../../i18n";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

interface CatalogLayoutProps {
  currency?: "USD" | "PEN";
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
  currency = "USD",
  categories: initialCategories,
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
  const { t } = useCatalogTranslations();
  const router = useRouter();

  // Categories and services local state
  const [categoriesList, setCategoriesList] = useState<CategoryDTO[]>(initialCategories);
  const [servicesList, setServicesList] = useState<DetailedServiceDTO[]>(initialServices);

  // Sync state when props refresh from server
  useEffect(() => {
    setServicesList(initialServices);
  }, [initialServices]);

  useEffect(() => {
    setCategoriesList(initialCategories);
  }, [initialCategories]);

  // Inspector selection state
  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(initialSelectedServiceId);
  const [isCreatingService, setIsCreatingService] = useState<boolean>(!initialSelectedServiceId && initialServices.length === 0);
  const [creatingServiceCategoryId, setCreatingServiceCategoryId] = useState<string | undefined>(undefined);

  // Filters state (UC-08 & UC-09)
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Expanded categories (all expanded by default)
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(initialCategories.map((c) => c.id))
  );

  // Modals state
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDTO | null>(null);

  // Selected service reference
  const selectedService = useMemo(
    () => (selectedServiceId ? servicesList.find((s) => s.id === selectedServiceId) : undefined),
    [selectedServiceId, servicesList]
  );

  // Filtered services based on search query and status filter
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      if (s.status === "DELETED") return false;
      if (statusFilter === "ACTIVE" && s.status !== "ACTIVE") return false;
      if (statusFilter === "INACTIVE" && s.status !== "INACTIVE") return false;
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesDesc = (s.description ?? "").toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }
      return true;
    });
  }, [servicesList, statusFilter, searchQuery]);

  // Toggle category accordion
  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Reorder categories via drag and drop (Punto 5 & UC-16)
  const handleReorderCategory = async (draggedCatId: string, targetCatId: string) => {
    const fromIndex = categoriesList.findIndex((c) => c.id === draggedCatId);
    const toIndex = categoriesList.findIndex((c) => c.id === targetCatId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;

    const updated = [...categoriesList];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    // Optimistic UI update
    setCategoriesList(updated);

    if (activeEstablishmentId) {
      const categoryIds = updated.map((c) => c.id);
      const res = await reorderCatalogCategoriesAction(activeEstablishmentId, categoryIds);
      if (res.status === "error") {
        setAlertMessage(res.error);
        setCategoriesList(initialCategories);
      }
    }
  };

  // Move service between categories via drag and drop (Punto 4 & UC-17)
  const handleMoveServiceCategory = async (serviceId: string, newCategoryId: string) => {
    const targetService = servicesList.find((s) => s.id === serviceId);
    if (!targetService || targetService.categoryId === newCategoryId) return;

    const previousCategoryId = targetService.categoryId;

    // Optimistic UI update
    setServicesList((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, categoryId: newCategoryId } : s))
    );

    const formData = new FormData();
    formData.append("id", targetService.id);
    formData.append("establishmentId", targetService.establishmentId ?? activeEstablishmentId ?? "");
    formData.append("name", targetService.name);
    formData.append("description", targetService.description ?? "");
    formData.append("price", String(targetService.price));
    formData.append("durationMinutes", String(targetService.durationMinutes));
    formData.append("preparationMinutes", String(targetService.preparationMinutes ?? 0));
    formData.append("cleanupMinutes", String(targetService.cleanupMinutes ?? 0));
    formData.append("categoryId", newCategoryId);

    const res = await updateCatalogServiceAction({ status: "idle", error: null }, formData);
    if (res.status === "error") {
      setAlertMessage(res.error);
      // Rollback
      setServicesList((prev) =>
        prev.map((s) => (s.id === serviceId ? { ...s, categoryId: previousCategoryId } : s))
      );
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-1 w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header Bar */}
      <div className="shrink-0 border-b border-border bg-card/40 px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search Input & Status Pills */}
          <div className="flex flex-1 items-center gap-3 max-w-xl">
            {/* Search Input (UC-08) */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.header?.searchPlaceholder ?? "Buscar servicios..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 h-9 text-sm bg-background border-border"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Pills (UC-09) */}
            <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-medium shrink-0">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "ALL"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.header?.filterAll ?? "Todos"}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ACTIVE")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "ACTIVE"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.header?.filterActive ?? "Activos"}
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("INACTIVE")}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === "INACTIVE"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.header?.filterInactive ?? "Inactivos"}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {canCreateCategory && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setIsCreateCategoryModalOpen(true)}
              >
                <FolderPlus className="size-4" />
                <span>{t.header?.newCategoryBtn ?? "Categoría"}</span>
              </Button>
            )}

            {canCreateService && (
              <Button
                type="button"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  setIsCreatingService(true);
                  setSelectedServiceId(undefined);
                  setCreatingServiceCategoryId(categoriesList[0]?.id);
                }}
              >
                <Plus className="size-4" />
                <span>{t.header?.newServiceBtn ?? "Nuevo servicio"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="flex flex-1 min-h-0 overflow-hidden flex-col md:flex-row">
        {/* Left Column: Categories and Services Accordion */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-4">
          <ErrorAlert
            title="Aviso"
            message={alertMessage ?? undefined}
          />

          {categoriesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-dashed border-border bg-card/40">
              <FolderPlus className="size-10 text-muted-foreground/60 mb-3" />
              <p className="text-sm font-medium text-foreground">
                {t.emptyState.noCategoriesYet ?? "Aún no tienes categorías creadas."}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Crea categorías para organizar tus servicios (ej. Cortes, Coloración, Manicura).
              </p>
              {canCreateCategory && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => setIsCreateCategoryModalOpen(true)}
                >
                  <Plus className="size-4" />
                  <span>{t.header?.newCategoryBtn ?? "+ Categoría"}</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {categoriesList.map((category) => (
                <CategoryItem
                  key={category.id}
                  cat={category}
                  services={filteredServices}
                  currency={currency}
                  selectedServiceId={selectedServiceId}
                  isExpanded={expandedCategoryIds.has(category.id)}
                  onToggleExpand={handleToggleExpand}
                  onSelectService={(serviceId) => {
                    setSelectedServiceId(serviceId);
                    setIsCreatingService(false);
                    setCreatingServiceCategoryId(undefined);
                  }}
                  onOpenEditCategoryModal={(cat) => setEditingCategory(cat)}
                  onDeleteCategory={(cat) => setCategoryToDelete(cat)}
                  onCreateService={(catId) => {
                    setIsCreatingService(true);
                    setCreatingServiceCategoryId(catId);
                    setSelectedServiceId(undefined);
                  }}
                  onMoveServiceCategory={handleMoveServiceCategory}
                  onReorderCategory={handleReorderCategory}
                  setAlertMessage={setAlertMessage}
                  canUpdateCategory={canUpdateCategory}
                  canDeleteCategory={canDeleteCategory}
                  canCreateService={canCreateService}
                  canUpdateService={canUpdateService}
                  canDeleteService={canDeleteService}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Unified Inspector Panel (Create / Edit) */}
        <div className="w-full md:w-[440px] lg:w-[480px] shrink-0 border-t md:border-t-0 md:border-l border-border bg-card/30 min-h-0 overflow-y-auto p-4 md:p-6">
          {isCreatingService ? (
            <CreateServiceForm
              key={`create-${creatingServiceCategoryId ?? "default"}`}
              establishmentId={activeEstablishmentId ?? ""}
              categoryId={creatingServiceCategoryId}
              categories={categoriesList}
              currency={currency}
              onSuccess={(newService) => {
                setServicesList((prev) => [newService, ...prev]);
                setSelectedServiceId(newService.id);
                setIsCreatingService(false);
                setCreatingServiceCategoryId(undefined);
                router.refresh();
              }}
              onCancel={() => {
                setIsCreatingService(false);
                setCreatingServiceCategoryId(undefined);
              }}
            />
          ) : selectedService ? (
            <EditServiceForm
              key={`edit-${selectedService.id}`}
              service={selectedService}
              establishmentId={activeEstablishmentId}
              categories={categoriesList}
              currency={currency}
              canUpdateService={canUpdateService}
              canDeleteService={canDeleteService}
              onCancel={() => setSelectedServiceId(undefined)}
              onSuccess={(updated) => {
                if (updated) {
                  setServicesList((prev) =>
                    prev.map((s) => (s.id === updated.id ? updated : s))
                  );
                }
                router.refresh();
              }}
              onDeleted={() => {
                setServicesList((prev) => prev.filter((s) => s.id !== selectedService.id));
                setSelectedServiceId(undefined);
                router.refresh();
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center p-6 rounded-xl border border-dashed border-border/80 bg-card/20">
              <div className="p-3 rounded-full bg-muted/60 text-muted-foreground mb-3">
                <Plus className="size-6" />
              </div>
              <p className="text-sm font-medium text-foreground">
                {t.emptyState.selectServicePrompt}
              </p>
              {canCreateService && (
                <Button
                  type="button"
                  size="sm"
                  className="mt-4 gap-1.5"
                  onClick={() => {
                    setIsCreatingService(true);
                    setSelectedServiceId(undefined);
                    setCreatingServiceCategoryId(categoriesList[0]?.id);
                  }}
                >
                  <Plus className="size-4" />
                  <span>{t.header?.newServiceBtn ?? "Nuevo servicio"}</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      {isCreateCategoryModalOpen && (
        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={() => {
            setIsCreateCategoryModalOpen(false);
            router.refresh();
          }}
          establishmentId={activeEstablishmentId}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          onClose={() => {
            setEditingCategory(null);
            router.refresh();
          }}
          category={editingCategory}
          establishmentId={activeEstablishmentId}
        />
      )}

      {categoryToDelete && (
        <DeleteCategoryDialog
          open={!!categoryToDelete}
          onOpenChange={(open) => {
            if (!open) setCategoryToDelete(null);
          }}
          categoryId={categoryToDelete.id}
          categoryName={categoryToDelete.name}
          establishmentId={activeEstablishmentId}
          onSuccess={() => {
            setCategoriesList((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
            setCategoryToDelete(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
