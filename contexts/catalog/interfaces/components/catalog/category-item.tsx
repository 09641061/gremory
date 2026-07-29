"use client";

import { useRouter } from "next/navigation";

import { FolderIcon, MoreVerticalIcon } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuEditItem,
  DropdownMenuCreateItem,
  DropdownMenuDeleteItem,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";
import type { CategoryDTO, ServiceSummaryDTO } from "./category-sidebar";

interface CategoryItemProps {
  cat: CategoryDTO;
  services: ServiceSummaryDTO[];
  selectedCategoryId?: string;
  selectedServiceId?: string;
  isExpanded: boolean;
  isDragTarget: boolean;
  onToggleExpand: (id: string) => void;
  onSelectService: (id: string) => void;
  onOpenEditCategoryModal: (category: CategoryDTO) => void;
  onDragStart: (e: React.DragEvent, serviceId: string) => void;
  onDragOver: (e: React.DragEvent, categoryId: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, categoryId: string) => void;
  setIsMobileOpen: (open: boolean) => void;
  onDeleteCategory: (category: CategoryDTO) => void;
  setAlertMessage: (msg: string | null) => void;
}

export function CategoryItem({
  cat,
  services,
  selectedCategoryId,
  selectedServiceId,
  isExpanded,
  isDragTarget,
  onToggleExpand,
  onSelectService,
  onOpenEditCategoryModal,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  setIsMobileOpen,
  onDeleteCategory,
  setAlertMessage,
}: CategoryItemProps) {
  const router = useRouter();
  const isCatSelected = selectedCategoryId === cat.id;
  const catServices = services.filter((s) => s.categoryId === cat.id);

  return (
    <div
      onDragOver={(e) => onDragOver(e, cat.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, cat.id)}
      className={`space-y-1 rounded-md transition-all ${
        isDragTarget ? "ring-2 ring-primary bg-primary/10" : ""
      }`}
    >
      <div
        className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors group/row ${
          isCatSelected
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-foreground hover:bg-accent/70 hover:text-accent-foreground"
        }`}
      >
        <button
          onClick={() => {
            onToggleExpand(cat.id);
          }}
          className="flex items-center gap-3 truncate flex-1 text-left"
        >
          <FolderIcon className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate">{cat.name}</span>
        </button>

        <div className="relative flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground transition-opacity"
                  title="Category Options"
                />
              }
            >
              <MoreVerticalIcon className="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="p-2 space-y-1 w-44">
              <DropdownMenuCreateItem
                label="Create Service"
                onClick={() => {
                  setIsMobileOpen(false);
                  router.push(`/catalog/new?categoryId=${cat.id}&t=${Date.now()}`);
                }}
              />
              <DropdownMenuEditItem
                onClick={() => {
                  onOpenEditCategoryModal(cat);
                }}
              />
              <DropdownMenuDeleteItem
                className={catServices.length > 0 ? "opacity-50 cursor-not-allowed" : ""}
                onClick={() => {
                  if (catServices.length > 0) {
                    setAlertMessage("You cannot delete a category that has services.");
                  } else {
                    onDeleteCategory(cat);
                  }
                }}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Show services if this category is expanded */}
      {isExpanded && (
        <div className="pl-0 space-y-1">
          {catServices.map((svc) => (
            <div
              key={svc.id}
              draggable
              onDragStart={(e) => onDragStart(e, svc.id)}
              className="group flex items-center cursor-grab active:cursor-grabbing"
            >
              <button
                onClick={() => {
                  onSelectService(svc.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors truncate ${
                  selectedServiceId === svc.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground"
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
}
