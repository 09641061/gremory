"use client";

import { GripVertical, Pencil, Trash2, User } from "lucide-react";
import type { WorkforceRoleSummary } from "@/contexts/workforce/application/model/workforce-role.read-models";
import { EntityActionsMenu } from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { useWorkforceTranslations } from "@/contexts/workforce/interfaces/i18n";

interface RoleRowProps {
  role: WorkforceRoleSummary;
  selected?: boolean;
  isDragging?: boolean;
  dropPosition?: "before" | "after" | null;
  /** Number of members currently assigned this role. Blocks deletion while > 0. */
  memberCount?: number;
  onSelect?: () => void;
  onEdit?: (role: WorkforceRoleSummary) => void;
  onDelete?: (role: WorkforceRoleSummary) => void;
  onDragStart?: (role: WorkforceRoleSummary) => void;
  onDragEnd?: () => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>, role: WorkforceRoleSummary) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>, role: WorkforceRoleSummary) => void;
  canUpdateRole?: boolean;
  canDeleteRole?: boolean;
}

export function RoleRow({
  role,
  selected = false,
  isDragging = false,
  dropPosition = null,
  memberCount = 0,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  canUpdateRole = true,
  canDeleteRole = true,
}: RoleRowProps) {
  const { t } = useWorkforceTranslations();
  const roleId = role.id;
  const canEdit = roleId !== null && !!onEdit && canUpdateRole;
  const assignedToMembers = memberCount > 0;
  const canDelete = roleId !== null && !!onDelete && canDeleteRole && !assignedToMembers;

  return (
    <div
      draggable={canUpdateRole}
      onDragStart={(event) => {
        if (!canUpdateRole) return;
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
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/30 text-muted-foreground"
          aria-hidden="true"
          title={t.permissions.dragToReorder}
        >
          <GripVertical className="size-4" />
        </span>
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
        <EntityActionsMenu
          label={t.permissions.moreActionsForRole.replace("{role}", role.name)}
          size="icon-sm"
          actions={[
            {
              label: t.permissions.edit,
              icon: Pencil,
              disabled: !canEdit,
              onSelect: () => onEdit?.(role),
            },
            {
              label: t.permissions.delete,
              icon: Trash2,
              variant: "destructive",
              disabled: !canDelete,
              title: assignedToMembers
                ? t.roleDialogs.deleteAssignedTooltip
                : undefined,
              onSelect: () => onDelete?.(role),
            },
          ]}
        />
      </div>
    </div>
  );
}