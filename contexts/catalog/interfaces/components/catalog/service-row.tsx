"use client";

import { GripVertical } from "lucide-react";
import type { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";

interface ServiceRowProps {
  svc: DetailedServiceDTO;
  currency?: "USD" | "PEN";
  isSelected: boolean;
  canUpdateService?: boolean;
  canDeleteService?: boolean;
  onSelectService: (id: string) => void;
  onDragStart: (e: React.DragEvent, serviceId: string) => void;
  onDragEnd: () => void;
  onDeleted?: (id: string) => void;
  setIsMobileOpen?: (open: boolean) => void;
}

export function ServiceRow({
  svc,
  currency = "USD",
  isSelected,
  onSelectService,
  onDragStart,
  onDragEnd,
  setIsMobileOpen,
}: ServiceRowProps) {
  const isActive = svc.status === "ACTIVE";

  const currencySymbol = currency === "PEN" ? "S/" : "$";
  const bufferMinutes = (svc.preparationMinutes ?? 0) + (svc.cleanupMinutes ?? 0);

  const handleClick = () => {
    onSelectService(svc.id);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-center justify-between gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isSelected
          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
          : "border-border/60 bg-card hover:border-border hover:bg-accent/40"
      } ${!isActive ? "opacity-75" : ""}`}
    >
      {/* Left: Drag Handle + Service Info (Name, Description, and Duration below) */}
      <div className="flex items-start gap-2.5 min-w-0 flex-1">
        <div
          draggable
          onDragStart={(e) => onDragStart(e, svc.id)}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground shrink-0 p-1 -ml-1 mt-0.5"
          title="Arrastrar para mover de categoría"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold truncate ${
                isActive ? "text-foreground" : "text-muted-foreground line-through"
              }`}
            >
              {svc.name}
            </span>
          </div>

          {svc.description && (
            <p className="text-xs text-muted-foreground truncate max-w-md">
              {svc.description}
            </p>
          )}

          {/* Duración abajo */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            <span className="font-medium bg-secondary/80 px-2 py-0.5 rounded text-secondary-foreground text-[11px]">
              {svc.durationMinutes} min
            </span>
            {bufferMinutes > 0 && (
              <span
                className="text-[11px] text-muted-foreground"
                title={`Prep: ${svc.preparationMinutes}m, Limp: ${svc.cleanupMinutes}m`}
              >
                (+{bufferMinutes}m)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Price */}
      <div className="flex items-center shrink-0 self-center">
        <span className="text-sm font-semibold text-foreground min-w-[70px] text-right">
          {currencySymbol} {Number(svc.price).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
