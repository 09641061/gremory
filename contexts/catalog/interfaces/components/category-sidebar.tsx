"use client";

import Link from "next/link";
import { PlusIcon, FolderIcon } from "lucide-react";
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
}

export function CategorySidebar({
  categories,
  services,
  selectedServiceId,
  selectedCategoryId,
  onSelectService,
  onSelectCategory,
  onOpenCreateCategoryModal,
}: CategorySidebarProps) {
  return (
    <aside className="w-[260px] bg-card border-r border-border flex flex-col shrink-0 h-full">
      <div className="p-4 flex flex-col gap-4 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Categories
          </span>
        </div>

        <Button
          onClick={onOpenCreateCategoryModal}
          className="w-full bg-[#00b77a] hover:bg-[#00b77a]/90 text-white font-medium gap-2"
        >
          <PlusIcon className="size-4" />
          <span>New Category</span>
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          onClick={() => onSelectCategory(undefined)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
            !selectedCategoryId
              ? "bg-primary/10 text-primary font-semibold"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <FolderIcon className="size-4 text-muted-foreground" />
          <span>All Services</span>
        </button>

        {categories.map((cat) => {
          const isCatSelected = selectedCategoryId === cat.id;
          const catServices = services.filter((s) => s.categoryId === cat.id);

          return (
            <div key={cat.id} className="space-y-1">
              <div
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  isCatSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <button
                  onClick={() => onSelectCategory(cat.id)}
                  className="flex items-center gap-3 truncate flex-1 text-left"
                >
                  <FolderIcon className="size-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {catServices.length}
                  </span>
                  <Link href={`/catalog/new?categoryId=${cat.id}`} passHref>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-primary hover:bg-primary/20"
                      title="New Service"
                    >
                      <PlusIcon className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>

              {isCatSelected && (
                <div className="pl-6 space-y-1">
                  {catServices.map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => onSelectService(svc.id)}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                        selectedServiceId === svc.id
                          ? "bg-[#00b77a] text-white font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {svc.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
