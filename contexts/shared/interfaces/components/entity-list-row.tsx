"use client";

import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/contexts/shared/interfaces/components/ui/avatar";
import {
  EntityActionsMenu,
  type EntityAction,
} from "@/contexts/shared/interfaces/components/entity-actions-menu";
import { cn } from "@/lib/utils";

interface EntityListRowProps {
  avatarSrc?: string | null;
  /** Icon (or any node) shown inside the avatar fallback when there is no image. */
  avatarFallbackIcon: ReactNode;
  name: string;
  /** Trailing badges/pills rendered next to the name, e.g. an "Editable" marker. */
  badges?: ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  /** Per-row actions menu (edit, delete, …). Omit to render no trigger at all. */
  actions?: EntityAction[];
  /** Accessible name for the actions trigger, e.g. "Actions for Acme". */
  actionsLabel?: string;
  className?: string;
}

/**
 * The single row used to list an entity (establishment, organization, member, …)
 * across contexts: avatar + truncated name + optional badges + optional actions
 * menu, with the same selected/preview visuals every list already used.
 */
export function EntityListRow({
  avatarSrc,
  avatarFallbackIcon,
  name,
  badges,
  selected = false,
  onSelect,
  actions,
  actionsLabel,
  className,
}: EntityListRowProps) {
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-muted/40",
        selected && "bg-accent/60",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={selected}
        onClick={onSelect}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left outline-none focus-visible:bg-muted/40"
      >
        <Avatar>
          <AvatarImage src={avatarSrc ?? undefined} alt={name} />
          <AvatarFallback>{avatarFallbackIcon}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{name}</p>
          {badges}
        </div>
      </button>
      {actions ? (
        <EntityActionsMenu
          label={actionsLabel ?? `Actions for ${name}`}
          size="icon-sm"
          actions={actions}
        />
      ) : null}
    </div>
  );
}
