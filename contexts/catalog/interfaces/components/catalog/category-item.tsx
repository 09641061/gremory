"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { EntityActionsMenu, type EntityAction } from "@/contexts/shared/interfaces/components/actions/entity-actions-menu";
import type { CategoryDTO, DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";
import { ServiceRow } from "./service-row";
import { useCatalogTranslations } from "../../i18n";

interface CategoryItemProps {
  cat: CategoryDTO;
  services: DetailedServiceDTO[];
  currency?: "USD" | "PEN";
  selectedServiceId?: string;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onSelectService: (id: string) => void;
  onOpenEditCategoryModal: (category: CategoryDTO) => void;
  onDeleteCategory: (category: CategoryDTO) => void;
  onCreateService?: (categoryId: string) => void;
  onMoveServiceCategory?: (serviceId: string, newCategoryId: string) => void;
  onReorderCategory?: (draggedCatId: string, targetCatId: string) => void;
  setAlertMessage: (msg: string | null) => void;
  canUpdateCategory: boolean;
  canDeleteCategory: boolean;
  canCreateService: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
}

export function CategoryItem({
  cat,
  services,
  currency = "USD",
  selectedServiceId,
  isExpanded,
  onToggleExpand,
  onSelectService,
  onOpenEditCategoryModal,
  onDeleteCategory,
  onCreateService,
  onMoveServiceCategory,
  onReorderCategory,
  setAlertMessage,
  canUpdateCategory,
  canDeleteCategory,
  canCreateService,
  canUpdateService,
  canDeleteService,
}: CategoryItemProps) {
  const { t } = useCatalogTranslations();
  const [isDragTarget, setIsDragTarget] = useState(false);
  const catServices = services.filter((s) => s.categoryId === cat.id);

  // Category Actions (3-dots menu)
  const categoryActions: EntityAction[] = [
    {
      label: t.sidebar.createService,
      icon: Plus,
      hidden: !canCreateService,
      onSelect: () => {
        if (onCreateService) onCreateService(cat.id);
      },
    },
    {
      label: t.sidebar.edit,
      icon: Pencil,
      hidden: !canUpdateCategory,
      onSelect: () => {
        onOpenEditCategoryModal(cat);
      },
    },
    {
      label: t.sidebar.delete,
      icon: Trash2,
      variant: "destructive",
      hidden: !canDeleteCategory,
      onSelect: () => {
        if (catServices.length > 0) {
          setAlertMessage(t.sidebar.cannotDeleteWithServices);
          return;
        }
        onDeleteCategory(cat);
      },
    },
  ];

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("application/x-catalog-category", cat.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (
      e.dataTransfer.types.includes("application/x-catalog-service") ||
      e.dataTransfer.types.includes("application/x-catalog-category")
    ) {
      e.dataTransfer.dropEffect = "move";
      if (!isDragTarget) setIsDragTarget(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragTarget(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragTarget(false);

    // 1. Check if dropped a service onto this category
    const serviceId = e.dataTransfer.getData("application/x-catalog-service");
    if (serviceId && onMoveServiceCategory) {
      onMoveServiceCategory(serviceId, cat.id);
      return;
    }

    // 2. Check if dropped a category for reordering
    const draggedCatId = e.dataTransfer.getData("application/x-catalog-category");
    if (draggedCatId && draggedCatId !== cat.id && onReorderCategory) {
      onReorderCategory(draggedCatId, cat.id);
    }
  };

  const handleServiceDragStart = (e: React.DragEvent, serviceId: string) => {
    e.stopPropagation();
    e.dataTransfer.setData("application/x-catalog-service", serviceId);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border transition-all ${
        isDragTarget
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border/70 bg-card/60 hover:border-border"
      }`}
    >
      {/* Category Header (not draggable itself to avoid breaking clicks on 3-dots) */}
      <div className="flex items-center justify-between p-3 select-none">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Grip handle to reorder categories - ONLY this is draggable */}
          <div
            draggable
            onDragStart={handleDragStart}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground shrink-0 p-1 -ml-1"
            title="Arrastrar para reordenar categoría"
          >
            <GripVertical className="size-4" />
          </div>

          <button
            type="button"
            onClick={() => onToggleExpand(cat.id)}
            className="flex items-center gap-2 truncate text-left flex-1 hover:text-primary transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            )}

            {isExpanded ? (
              <FolderOpen className="size-4 text-primary shrink-0" />
            ) : (
              <FolderClosed className="size-4 text-muted-foreground shrink-0" />
            )}

            {/* Category name without count */}
            <span className="font-semibold text-sm text-foreground truncate">
              {cat.name}
            </span>
          </button>
        </div>

        {/* 3-dots actions menu with event isolation */}
        <div
          className="shrink-0 pl-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <EntityActionsMenu
            actions={categoryActions}
            label={t.sidebar.moreActionsForCategory.replace("{name}", cat.name)}
            title={t.sidebar.categoryOptions}
            size="icon-sm"
          />
        </div>
      </div>

      {/* Services List inside Category */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 space-y-2 border-t border-border/40">
          {catServices.length === 0 ? (
            <div className="py-4 text-center rounded-lg border border-dashed border-border/80 text-xs text-muted-foreground">
              No hay servicios en esta categoría. Arrastra servicios aquí o usa el menú de 3 puntos para crear uno.
            </div>
          ) : (
            catServices.map((service) => (
              <ServiceRow
                key={service.id}
                svc={service}
                currency={currency}
                isSelected={selectedServiceId === service.id}
                canUpdateService={canUpdateService}
                canDeleteService={canDeleteService}
                onSelectService={onSelectService}
                onDragStart={handleServiceDragStart}
                onDragEnd={() => {}}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
