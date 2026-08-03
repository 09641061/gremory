"use client";

import {
  AlertDialog as AlertDialogPrimitive,
  AlertDialogContent,
  AlertDialogFooter,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import type { ReactNode } from "react";

interface AppointmentConfirmDialogShellProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  footer: ReactNode;
}

export function AppointmentConfirmDialogShell({
  isOpen,
  onOpenChange,
  children,
  footer,
}: AppointmentConfirmDialogShellProps) {
  return (
    <AlertDialogPrimitive open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="relative max-w-md">
        {children}

        <AlertDialogFooter>
          <div className="w-full">{footer}</div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogPrimitive>
  );
}

export function AppointmentConfirmDialogHeader({
  title,
  description,
  titleClassName,
}: {
  title: string;
  description: string;
  titleClassName?: string;
}) {
  return (
    <div className="space-y-2">
      <h2 className={titleClassName}>{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
