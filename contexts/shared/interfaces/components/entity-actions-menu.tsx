"use client";

import type { LucideIcon } from "lucide-react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/contexts/shared/interfaces/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/contexts/shared/interfaces/components/ui/dropdown-menu";

export type EntityAction = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  /** `destructive` paints the item with the destructive token, never the accent color. */
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Tooltip shown when the item is disabled, e.g. why a delete is blocked. */
  title?: string;
  /** Skips the item entirely, e.g. when the user lacks the permission. */
  hidden?: boolean;
};

interface EntityActionsMenuProps {
  actions: EntityAction[];
  /** Accessible name for the trigger, e.g. "More actions for Acme". */
  label: string;
  /** Optional tooltip title when the UI uses a shorter legacy label. */
  title?: string;
  disabled?: boolean;
  size?: "icon" | "icon-sm";
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * The single row/entity actions menu (edit, delete, …) used across contexts,
 * so every "Delete" looks and behaves the same.
 */
export function EntityActionsMenu({
  actions,
  label,
  title,
  disabled,
  size = "icon",
  triggerClassName,
  contentClassName,
}: EntityActionsMenuProps) {
  const visibleActions = actions.filter((action) => !action.hidden);

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="ghost"
            size={size}
            aria-label={label}
            title={title ?? label}
            className={triggerClassName}
          />
        }
      >
        <MoreVertical className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={contentClassName}>
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={action.label}
              variant={action.variant}
              disabled={action.disabled}
              title={action.disabled ? action.title : undefined}
              onClick={action.onSelect}
              className="gap-2 whitespace-nowrap"
            >
              {Icon && <Icon className="size-3.5" />}
              <span>{action.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
