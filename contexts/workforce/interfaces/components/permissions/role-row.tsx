"use client";

import { GripVertical, MoreVertical, Pencil, Trash2, User } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";

interface RoleRowProps {
  role: WorkforceRoleSummary;
  selected?: boolean;
  isDragging?: boolean;
  dropPosition?: "before" | "after" | null;
  onSelect?: () => void;
  onEdit?: (role: WorkforceRoleSummary) => void;
  onDelete?: (role: WorkforceRoleSummary) => void;
  onDragStart?: (role: WorkforceRoleSummary) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>, role: WorkforceRoleSummary) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>, role: WorkforceRoleSummary) => void;
}

export function RoleRow({
  role,
  selected = false,
  isDragging = false,
  dropPosition = null,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: RoleRowProps) {
  const roleId = role.id;
  const canEdit = roleId !== null && !role.systemRole && !!onEdit;
  const canDelete = roleId !== null && !role.systemRole && !!onDelete;

  return (
    <div
      draggable={!role.systemRole}
      onDragStart={(event) => {
        if (role.systemRole) return;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", roleId ?? "");
        onDragStart?.(role);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      onDragOver={(event) => {
        onDragOver?.(event, role);
      }}
      onDrop={(event) => {
        onDrop?.(event, role);
      }}
      className={`grid cursor-grab items-center gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40 active:cursor-grabbing sm:grid-cols-[minmax(0,1fr)_auto] ${
        selected ? "bg-accent/60" : ""
      } ${isDragging ? "opacity-50" : ""} ${
        dropPosition === "before"
          ? "border-t-2 border-t-primary bg-primary/5"
          : dropPosition === "after"
            ? "border-b-2 border-b-primary bg-primary/5"
            : ""
      } relative`}
      aria-grabbed={isDragging}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <div className="flex min-w-0 items-center gap-3">
        {!role.systemRole ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground"
            aria-hidden="true"
            title="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </span>
        ) : null}
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground">
          <User className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium text-foreground">{role.name}</p>
        </div>
      </div>

      <div
        className="relative flex items-center justify-end gap-2"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={`More actions for ${role.name}`}
              />
            }
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              nativeButton
              render={<button type="button" className="w-full" />}
              className="gap-2"
              disabled={!canEdit}
              onClick={() => onEdit?.(role)}
            >
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              nativeButton
              render={<button type="button" className="w-full" />}
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
              disabled={!canDelete}
              onClick={() => onDelete?.(role)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

