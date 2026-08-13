"use client";

import { useState } from "react";
import {
  PlusIcon,
  FolderXIcon,
  MenuIcon,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
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
      <div className="p-4 flex flex-col gap-4 border-b border-border/60">
        {canCreateCategory && (
          <Button
            onClick={() => {
              setIsMobileOpen(false);
              onOpenCreateCategoryModal();
            }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
          >
            <PlusIcon className="size-4" />
            <span>Create Category</span>
          </Button>
        )}
        {canCreateService && (
          <Button
            variant="outline"
            onClick={() => {
              setIsMobileOpen(false);
              onCreateService?.(undefined);
            }}
            className="w-full font-medium gap-2"
          >
            <PlusIcon className="size-4" />
            <span>Create Service</span>
          </Button>
        )}
      </div>

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
            <p className="text-xs font-medium">No categories available</p>
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
            <span>Categories ({categories.length})</span>
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
        title="Cannot Delete"
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
