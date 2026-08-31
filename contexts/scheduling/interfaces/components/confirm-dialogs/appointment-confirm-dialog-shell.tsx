"use client";

import type { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/contexts/shared/interfaces/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface AppointmentConfirmDialogShellProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  /** `destructive` tints the title for irreversible transitions. */
  tone?: "default" | "destructive";
  /** Optional body rendered between the header and the footer. */
  children?: ReactNode;
  footer: ReactNode;
}

/**
 * Presentation shell for every appointment confirmation dialog.
 *
 * It renders `AlertDialogTitle`/`AlertDialogDescription` rather than bare
 * headings so the dialog is announced with an accessible name and description.
 */
export function AppointmentConfirmDialogShell({
  isOpen,
  onOpenChange,
  title,
  description,
  tone = "default",
  children,
  footer,
}: AppointmentConfirmDialogShellProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className={cn(tone === "destructive" && "text-destructive")}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {children}

        <AlertDialogFooter>{footer}</AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
