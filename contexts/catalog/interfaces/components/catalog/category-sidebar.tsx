"use client";

import { useState } from "react";
import {
  PlusIcon,
  FolderXIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { ErrorAlert } from "@/contexts/shared/interfaces/components/error";
import { CategoryItem } from "./category-item";
import { DeleteCategoryDialog } from "./delete-category-dialog";

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
  onMoveServiceCategory?: (serviceId: string, newCategoryId: string) => void;
  onCreateService?: (categoryId: string) => void;
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

  const handleDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOverCategoryId(categoryId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCategoryId(null);
  };

  const handleDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
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
        <div className="flex items-center justify-center relative w-full">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="absolute right-0 h-(--app-sidebar-control-height) w-(--app-sidebar-control-height) text-muted-foreground md:hidden"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

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
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <FolderXIcon className="size-8 opacity-40 text-muted-foreground" />
            <p className="text-xs font-medium">No categories available</p>
          </div>
        ) : (
          categories.map((cat) => (
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
          ))
        )}
      </nav>
    </aside>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-3 bg-background border-b border-border/60 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(true)}
          className="gap-2 text-xs"
        >
          <MenuIcon className="size-4" />
          <span>Categories ({categories.length})</span>
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">{sidebarContent}</div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50">
          <div className="h-full w-(--app-category-sidebar-mobile-width) bg-background shadow-xl animate-in slide-in-from-left">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}
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
