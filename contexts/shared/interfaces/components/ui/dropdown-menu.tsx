"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

function DropdownMenu(props: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root {...props} />;
}

const DropdownMenuTrigger = MenuPrimitive.Trigger;

function DropdownMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Popup>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner className="z-50" sideOffset={4} align="end">
        <MenuPrimitive.Popup
          className={cn(
            "z-50 min-w-36 overflow-hidden rounded-md border border-border bg-card p-1 text-card-foreground shadow-md outline-none",
            "transition-[scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            className
          )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item>) {
  return (
    <MenuPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
        "focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Separator>) {
  return (
    <MenuPrimitive.Separator
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function DropdownMenuEditItem({
  className,
  label = "Edit",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { label?: string }) {
  return (
    <DropdownMenuItem className={cn("gap-2 cursor-pointer", className)} {...props}>
      <Pencil className="size-3.5 text-muted-foreground" />
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

function DropdownMenuCreateItem({
  className,
  label = "Create",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { label?: string }) {
  return (
    <DropdownMenuItem className={cn("text-foreground font-medium gap-2 cursor-pointer", className)} {...props}>
      <Plus className="size-3.5 text-muted-foreground" />
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

function DropdownMenuDeleteItem({
  className,
  label = "Delete",
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Item> & { label?: string }) {
  return (
    <DropdownMenuItem
      className={cn(
        "text-destructive gap-2 cursor-pointer focus:bg-destructive/10 focus:text-destructive",
        className
      )}
      {...props}
    >
      <Trash2 className="size-3.5" />
      <span>{label}</span>
    </DropdownMenuItem>
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuEditItem,
  DropdownMenuCreateItem,
  DropdownMenuDeleteItem,
};
