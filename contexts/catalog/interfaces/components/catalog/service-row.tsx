"use client";

import { useState } from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { Switch } from "@/contexts/shared/interfaces/components/ui/switch";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import { DeleteServiceDialog } from "./delete-service-dialog";
import { useChangeCatalogServiceStatus } from "../../hooks/use-change-catalog-service-status";
import type { DetailedServiceDTO } from "@/contexts/catalog/application/model/catalog-view.models";

interface ServiceRowProps {
  svc: DetailedServiceDTO;
  currency?: "USD" | "PEN";
  isSelected: boolean;
  canUpdateService: boolean;
  canDeleteService: boolean;
  onSelectService: (id: string) => void;
  onDragStart: (e: React.DragEvent, serviceId: string) => void;
  onDragEnd: () => void;
  onDeleted?: (id: string) => void;
}

export function ServiceRow({
  svc,
  currency = "USD",
  isSelected,
  canUpdateService,
  canDeleteService,
  onSelectService,
  onDragStart,
  onDragEnd,
  onDeleted,
}: ServiceRowProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { changeStatus, pending: statusPending } = useChangeCatalogServiceStatus();
  const isActive = svc.status === "ACTIVE";

  const currencySymbol = currency === "PEN" ? "S/" : "$";
  const bufferMinutes = (svc.preparationMinutes ?? 0) + (svc.cleanupMinutes ?? 0);

  return (
    <>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, svc.id)}
        onDragEnd={onDragEnd}
        onClick={() => onSelectService(svc.id)}
        className={`group relative flex items-center justify-between gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
          isSelected
            ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
            : "border-border/60 bg-card hover:border-border hover:bg-accent/40"
        } ${!isActive ? "opacity-75" : ""}`}
      >
        {/* Left: Drag Handle + Service Info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-foreground shrink-0 p-1 -ml-1"
            title="Arrastrar para mover de categoría"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="size-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold truncate ${isActive ? "text-foreground" : "text-muted-foreground line-through"}`}>
                {svc.name}
              </span>
            </div>

            {svc.description && (
              <p className="text-xs text-muted-foreground truncate max-w-md mt-0.5">
                {svc.description}
              </p>
            )}
          </div>
        </div>

        {/* Middle/Right: Badges + Price */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-medium bg-secondary px-2 py-0.5 rounded text-secondary-foreground">
              {svc.durationMinutes} min
            </span>
            {bufferMinutes > 0 && (
              <span className="text-[11px] text-muted-foreground" title={`Prep: ${svc.preparationMinutes}m, Limp: ${svc.cleanupMinutes}m`}>
                (+{bufferMinutes}m)
              </span>
            )}
          </div>

          <span className="text-sm font-semibold text-foreground min-w-[70px] text-right">
            {currencySymbol} {Number(svc.price).toFixed(2)}
          </span>

          {/* Active Switch */}
          <div
            className="flex items-center shrink-0 pl-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              checked={isActive}
              disabled={!canUpdateService || statusPending}
              onCheckedChange={(checked) => {
                changeStatus(svc.id, checked, svc.establishmentId);
              }}
              aria-label="Activar o desactivar servicio"
            />
          </div>

          {/* Delete Button */}
          {canDeleteService && (
            <div
              className="shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => setIsDeleteDialogOpen(true)}
                title="Eliminar servicio"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isDeleteDialogOpen && (
        <DeleteServiceDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          serviceId={svc.id}
          serviceName={svc.name}
          establishmentId={svc.establishmentId}
          onSuccess={() => {
            setIsDeleteDialogOpen(false);
            if (onDeleted) onDeleted(svc.id);
          }}
        />
      )}
    </>
  );
}
