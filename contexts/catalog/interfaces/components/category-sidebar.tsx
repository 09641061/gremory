"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  FolderIcon,
  FolderXIcon,
  MenuIcon,
  XIcon,
  GripVerticalIcon,
  PencilIcon,
} from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";

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
}: CategorySidebarProps) {
  const router = useRouter();
  const [draggedServiceId, setDraggedServiceId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    <aside className="w-full md:w-[260px] bg-background border-r border-border/60 flex flex-col shrink-0 h-full">
      <div className="p-4 flex flex-col gap-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categories
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden h-8 w-8 text-muted-foreground"
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <Button
          onClick={() => {
            setIsMobileOpen(false);
            onOpenCreateCategoryModal();
          }}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2"
        >
          <PlusIcon className="size-4" />
          <span>New Category</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <FolderXIcon className="size-8 opacity-40 text-muted-foreground" />
            <p className="text-xs font-medium">No categories available</p>
          </div>
        ) : (
          categories.map((cat) => {
            const isCatSelected = selectedCategoryId === cat.id;
            const isCatExpanded = expandedCategoryIds.has(cat.id);
            const catServices = services.filter((s) => s.categoryId === cat.id);
            const isTarget = dragOverCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onDragOver={(e) => handleDragOver(e, cat.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, cat.id)}
                className={`space-y-1 rounded-md transition-all ${
                  isTarget ? "ring-2 ring-primary bg-primary/10" : ""
                }`}
              >
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors group/row ${
                    isCatSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <button
                    onClick={() => {
                      handleToggleCategory(cat.id);
                    }}
                    className="flex items-center gap-3 truncate flex-1 text-left"
                  >
                    <FolderIcon className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{cat.name}</span>
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEditCategoryModal(cat);
                      }}
                      className="h-6 w-6 text-muted-foreground opacity-0 group-hover/row:opacity-100 hover:text-foreground transition-opacity"
                      title="Edit Category Name"
                    >
                      <PencilIcon className="size-3" />
                    </Button>

                    <span className="text-xs text-muted-foreground">
                      {catServices.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileOpen(false);
                        // Navigate programmatically with a timestamp to reset create form instance state
                        router.push(`/catalog/new?categoryId=${cat.id}&t=${Date.now()}`);
                      }}
                      className="h-6 w-6 text-primary hover:bg-primary/20"
                      title="New Service"
                    >
                      <PlusIcon className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Show services if this category is expanded */}
                {isCatExpanded && (
                  <div className="pl-6 space-y-1">
                    {catServices.map((svc) => (
                      <div
                        key={svc.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, svc.id)}
                        className="group flex items-center gap-1 cursor-grab active:cursor-grabbing"
                      >
                        <GripVerticalIcon className="size-3 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                        <button
                          onClick={() => {
                            onSelectService(svc.id);
                            setIsMobileOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 text-xs rounded-md transition-colors truncate ${
                            selectedServiceId === svc.id
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          {svc.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
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
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50 backdrop-blur-sm">
          <div className="w-[280px] h-full bg-background shadow-xl animate-in slide-in-from-left">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setIsMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
