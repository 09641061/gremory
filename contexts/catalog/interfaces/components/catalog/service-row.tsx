"use client";

import { GripVertical } from "lucide-react";
import type { ServiceSummaryDTO } from "./category-sidebar";

interface ServiceRowProps {
  svc: ServiceSummaryDTO;
  isSelected: boolean;
  onSelectService: (id: string) => void;
  onDragStart: (e: React.DragEvent, serviceId: string) => void;
  onDragEnd: () => void;
  setIsMobileOpen: (open: boolean) => void;
}

export function ServiceRow({
  svc,
  isSelected,
  onSelectService,
  onDragStart,
  onDragEnd,
  setIsMobileOpen,
}: ServiceRowProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, svc.id)}
      onDragEnd={onDragEnd}
      className="group flex items-center cursor-grab active:cursor-grabbing w-full"
    >
      <button
        onClick={() => {
          onSelectService(svc.id);
          setIsMobileOpen(false);
        }}
        className={`flex h-(--app-sidebar-control-height) w-full items-center gap-(--app-sidebar-control-gap) truncate rounded-(--app-sidebar-item-radius) px-(--app-sidebar-control-padding-x) text-left text-sm transition-colors ${
          isSelected
            ? "bg-accent text-accent-foreground font-semibold"
            : "text-foreground hover:bg-accent/70 hover:text-accent-foreground"
        }`}
      >
        <GripVertical className={`size-4 shrink-0 cursor-grab ${
          isSelected ? "text-accent-foreground" : "text-muted-foreground/60"
        }`} />
        <span className="truncate">{svc.name}</span>
      </button>
    </div>
  );
}
