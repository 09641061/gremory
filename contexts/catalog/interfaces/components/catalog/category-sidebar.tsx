"use client";

import { useState } from "react";
import {
  PlusIcon,
  FolderXIcon,
  PackagePlusIcon,
  ChevronDownIcon,
  MenuIcon,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ButtonGroup } from "@/contexts/shared/interfaces/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/contexts/shared/interfaces/components/ui/sheet";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { CategoryItem } from "./category-item";
import { ServiceRow } from "./service-row";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { useCatalogTranslations } from "../../i18n";

// Sentinel used as drop-target key for the "Uncategorized" bucket, which has no real category id
const UNCATEGORIZED_DROP_ID = "__uncategorized__";

export type CategoryDTO = {
  id: string;
  name: string;
};

export type ServiceSummaryDTO = {
  id: string;
  name: string;
  categoryId?: string | null;
};

interface CategorySidebarProps {
  categories: CategoryDTO[];
  services: ServiceSummaryDTO[];
  selectedServiceId?: string;
  selectedCategoryId?: string;
  onSelectService: (id: string) => void;
  onSelectCategory: (id?: string) => void;
  onOpenCreateCategoryModal: () => void;
  onOpenEditCategoryModal: (category: CategoryDTO) => void;
  onMoveServiceCategory?: (serviceId: string, newCategoryId: string | null) => void;
  onCreateService?: (categoryId?: string) => void;
  canCreateCategory: boolean;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
}

export function CategorySidebar({
  categories,
  services,
  selectedServiceId,
  selectedCategoryId,
  onSelectService,
  onSelectCategory,
  onOpenCreateCategoryModal,
  onOpenEditCategoryModal,
  onMoveServiceCategory,
  onCreateService,
  canCreateCategory,
  canUpdateCategory,
  canDeleteCategory,
  canCreateService,
}: CategorySidebarProps) {
  const { t } = useCatalogTranslations();
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDTO | null>(null);

  // Keep track of which categories are expanded in a Set
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    new Set(selectedCategoryId ? [selectedCategoryId] : [])
  );

  // Services with no category still belong in the sidebar, listed loose at the top
  const uncategorizedServices = services.filter((s) => !s.categoryId);
  const isEmpty = categories.length === 0 && uncategorizedServices.length === 0;



  // Toggle category expansion on click without collapsing other categories
  const handleToggleCategory = (categoryId: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
    // Still notify parent component about selection
    onSelectCategory(categoryId);
  };

  const handleDragStart = (e: React.DragEvent, serviceId: string) => {
    e.dataTransfer.setData("text/plain", serviceId);
    setDraggedServiceId(serviceId);
  };

  const handleDragEnd = () => {
    setDraggedServiceId(null);
    setDragOverCategoryId(null);
  };

  // Categories sit inside the nav, which is itself a drop target, so each handler stops
  // propagation to keep the innermost target the effective one
  const handleDragOver = (e: React.DragEvent, dropTargetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategoryId(dropTargetId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategoryId(null);
  };

  const handleDrop = (e: React.DragEvent, categoryId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const serviceId = e.dataTransfer.getData("text/plain") || draggedServiceId;
    if (serviceId && onMoveServiceCategory) {
      onMoveServiceCategory(serviceId, categoryId);
    }
    setDraggedServiceId(null);
    setDragOverCategoryId(null);
  };

  const sidebarContent = (
    <aside className="flex h-full w-full shrink-0 flex-col border-r border-border/60 bg-background md:w-(--app-category-sidebar-width)">
      {(canCreateService || canCreateCategory) && (
        <div className="p-4 border-b border-border/60">
          {/* One button, not two. The category is what the catalog is built out
              of, so it stays the visible action and the service sits behind the
              chevron. Two equal blocks stacked here made the reader choose
              between them on every visit. */}
          <ButtonGroup className="w-full">
            <Button
              onClick={() => {
                setIsMobileOpen(false);
                if (canCreateCategory) {
                  onOpenCreateCategoryModal();
                } else {
                  onCreateService?.(undefined);
                }
              }}
              // `border-0` because the button paints with `bg-clip-padding`:
              // its transparent border would leave a pale edge along the seam.
              className="flex-1 gap-2 border-0 font-medium"
            >
              <PlusIcon className="size-4" />
              <span>{canCreateCategory ? t.sidebar.createCategory : t.sidebar.createService}</span>
            </Button>

            {/* The chevron only earns its place when there is a second thing to
                create; with one permission the button stands alone. */}
            {canCreateCategory && canCreateService && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      aria-label={t.sidebar.moreThingsToCreate}
                      // Not `size="icon"`: that is 32px against the 36px of the
                      // control beside it, and the group would step down at the
                      // seam. The divider is an inset line inside the fill, so
                      // nothing of the page shows between the two halves.
                      className="w-9 shrink-0 border-0 px-0 shadow-[inset_1px_0_0_0_rgb(255_255_255/0.2)]"
                    />
                  }
                >
                  <ChevronDownIcon className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setIsMobileOpen(false);
                      onCreateService?.(undefined);
                    }}
                    className="gap-2 whitespace-nowrap"
                  >
                    <PackagePlusIcon className="size-3.5" />
                    <span>{t.sidebar.createService}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </ButtonGroup>
        </div>
      )}

      {/* Dropping on the sidebar's free space (outside any category) clears the service's category */}
      <nav
        onDragOver={(e) => handleDragOver(e, UNCATEGORIZED_DROP_ID)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, null)}
        className={`flex-1 overflow-y-auto p-2 space-y-1 transition-colors ${
          dragOverCategoryId === UNCATEGORIZED_DROP_ID ? "bg-primary/5" : ""
        }`}
      >
        {isEmpty ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <FolderXIcon className="size-8 opacity-40 text-muted-foreground" />
            <p className="text-xs font-medium">{t.sidebar.noCategories}</p>
          </div>
        ) : (
          <>
            {/* Services with no category hang loose at the top, no bucket around them */}
            {uncategorizedServices.map((svc) => (
              <ServiceRow
                key={svc.id}
                svc={svc}
                isSelected={selectedServiceId === svc.id}
                onSelectService={onSelectService}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                setIsMobileOpen={setIsMobileOpen}
              />
            ))}

            {categories.map((cat) => (
              <CategoryItem
                key={cat.id}
                cat={cat}
                services={services}
                selectedCategoryId={selectedCategoryId}
                selectedServiceId={selectedServiceId}
                isExpanded={expandedCategoryIds.has(cat.id)}
                isDragTarget={dragOverCategoryId === cat.id}
                onToggleExpand={handleToggleCategory}
                onSelectService={onSelectService}
                onOpenEditCategoryModal={onOpenEditCategoryModal}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                setIsMobileOpen={setIsMobileOpen}
                onDeleteCategory={setCategoryToDelete}
                setAlertMessage={setAlertMessage}
                onCreateService={onCreateService}
                canUpdateCategory={canUpdateCategory}
                canDeleteCategory={canDeleteCategory}
                canCreateService={canCreateService}
              />
            ))}
          </>
        )}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile Drawer */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <div className="md:hidden p-3 bg-background border-b border-border/60 flex items-center justify-between">
          <SheetTrigger
            render={<Button variant="outline" size="sm" className="gap-2 text-xs" />}
          >
            <MenuIcon className="size-4" />
            <span>{t.sidebar.categoriesCount.replace("{count}", String(categories.length))}</span>
          </SheetTrigger>
        </div>

        <SheetContent
          side="left"
          className="w-(--app-category-sidebar-mobile-width) gap-0 p-0 md:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Categories</SheetTitle>
          </SheetHeader>
          {sidebarContent}
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">{sidebarContent}</div>
      <ErrorAlert
        title={t.sidebar.cannotDeleteTitle}
        message={alertMessage ?? undefined}
        onDismiss={() => setAlertMessage(null)}
      />

      {categoryToDelete && (
        <DeleteCategoryDialog
          categoryId={categoryToDelete.id}
          categoryName={categoryToDelete.name}
          open={!!categoryToDelete}
          onOpenChange={(open) => {
            if (!open) setCategoryToDelete(null);
          }}
        />
      )}
    </>
  );
}
