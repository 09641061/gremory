"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * FormSection — header + body wrapper that owns the visual rhythm of a form.
 *
 * Spacing contract
 * ----------------
 * - **Top padding between sections**: 24px (`pt-6`). This matches the
 *   `border-t border-border/70 pt-6` separator the customer form already
 *   uses today, so adopting FormSection produces a pixel-identical layout.
 * - **Vertical gap between fields inside the section**: 16px (`space-y-4`).
 *   This is the same gap the customer form's `space-y-4` containers use, so
 *   a section wrapping a single FormField renders identically to a section
 *   wrapping a row of FormFields.
 * - **Header to body gap**: 16px (`space-y-4`). When the header is omitted,
 *   the body still has a 16px top gap inside the section so it doesn't slam
 *   against the section border.
 *
 * The header is fully optional — passing neither `title` nor `description`
 * drops the `<header>` element entirely so the spacing tokens still apply
 * without an empty wrapper polluting the DOM.
 *
 * Sections are designed to be siblings: the `pt-6 + border-t` lives on the
 * section, so stacking them gives a divider between each section.
 */
export interface FormSectionProps {
  /** Section heading (already translated). */
  title?: string;
  /** Supporting copy shown under the title (already translated). */
  description?: string;
  /** Form fields or arbitrary form content. */
  children: React.ReactNode;
  /** Optional className for the root `<section>`. */
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  const hasHeader = Boolean(title) || Boolean(description);

  return (
    <section
      className={cn("space-y-4 border-t border-border/70 pt-6", className)}
    >
      {hasHeader ? (
        <header className="space-y-1">
          {title ? (
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </header>
      ) : null}

      <div className="space-y-4">{children}</div>
    </section>
  );
}
