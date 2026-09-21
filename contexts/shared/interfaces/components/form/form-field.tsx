"use client";

import * as React from "react";

import { Label } from "@/contexts/shared/interfaces/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * FormField — Label + Input + ErrorMessage wrapper.
 *
 * Why a wrapper?
 * --------------
 * Every form in the CRM, scheduling and catalog contexts repeats the same
 * five concerns: a `<Label htmlFor>` linked to an input, an error message
 * with `role="alert"` for screen readers, a hint connected via
 * `aria-describedby`, an `aria-invalid` toggle, and the destructive ring
 * (already baked into the Input primitive). The repetition is what made the
 * form audit list ~300 lines of duplicated scaffolding.
 *
 * What this owns
 * --------------
 * - Stable layout: consistent vertical rhythm (`space-y-1.5`) — i.e. 6px
 *   between the label, input and any help text — across every form.
 * - Accessibility wiring: `htmlFor`, `aria-invalid`, `aria-describedby`,
 *   `role="alert"` on the error and a stable id derivation strategy so
 *   multiple FormFields on the same page never collide.
 * - Error visibility: renders the error message below the input only when
 *   `error` is a non-empty string. Falsy values (`undefined`, `null`, `""`)
 *   intentionally render nothing — this keeps the same component usable for
 *   inline-validation AND for top-of-form summary alerts.
 * - Inline companion slot: when a consumer needs a Button / Icon / Link
 *   rendered next to the input (e.g. an autofill Button next to a document
 *   number field), they pass it as `trailingAdornment`. FormField wraps the
 *   input + adornment in a single flex row so the input expands (`flex-1`)
 *   and the adornment keeps its natural size. Without this slot, consumers
 *   were forced to drop down to bespoke `<div>` markup and break out of the
 *   FormField abstraction.
 *
 * What this does NOT own
 * ----------------------
 * - The input itself. Consumers pass the input as `children` (an Input,
 *   NativeSelect, Textarea, Combobox, PhoneInput, etc.). This is what lets
 *   the same wrapper work for every shape of field without re-implementing
 *   the a11y wiring per primitive.
 * - The error translation. Consumers pass the already-translated string.
 * - The adornment's behaviour. The adornment is opaque to FormField — it
 *   owns its own `type="button"` (for Buttons so the form does not submit),
 *   its own `aria-label` (for icon-only adornments), its own disabled state,
 *   etc.
 *
 * Spacing rationale
 * -----------------
 * `space-y-1.5` (24px in a 16px-root, with a 4px step = 6px) is the
 * same rhythm the customer form uses today (`space-y-1.5`). Anything
 * tighter feels cramped under a 14px label; anything looser breaks the
 * baseline grid in the surrounding form sections.
 */
export interface FormFieldProps {
  /** DOM id of the input the label is bound to. */
  id: string;
  /** Visible label text (already translated). */
  label: string;
  /**
   * Error message to surface below the input. Falsy values render nothing.
   * The string is treated as already-localized — pass `t.form...` here.
   */
  error?: string | null;
  /** Optional helper text shown below the input when no error is present. */
  hint?: string | null;
  /** Visually marks the label as required (appends an asterisk). */
  required?: boolean;
  /** The input element(s) this field wraps. */
  children: React.ReactNode;
  /** Optional className for the wrapper `<div>`. */
  className?: string;
  /**
   * Optional element rendered to the right of the input, inside the same
   * flex container. The input grows to fill the remaining width via
   * `flex-1`; the adornment keeps its natural size. Typical adornments:
   * an autofill Button, a unit suffix icon, or a help Link.
   *
   * Accessibility note: the adornment's wrapper is purely structural — it
   * carries NO `aria-invalid` / `aria-describedby`. Those live on the input
   * itself, which is the only element a screen reader reads as the field.
   *
   * When `trailingAdornment` is `undefined` or `null`, no flex wrapper is
   * rendered — the input is a direct child of the FormField, preserving the
   * pre-existing DOM contract used by every other form in the project.
   */
  trailingAdornment?: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  hint,
  required = false,
  children,
  className,
  trailingAdornment,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hasError ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  /*
   * 1. Forward a11y props to the child input.
   *
   * We rely on the child's own `aria-invalid` handling — the Input
   * primitive already styles itself with a destructive ring on
   * `aria-invalid="true"`. We clone the child only when needed to forward
   * `aria-invalid` + `aria-describedby` so consumers don't have to remember
   * to wire them on every Input. If the consumer already passes them, our
   * values win because we spread LAST.
   *
   * Non-element children (strings, fragments, multi-input groups) fall
   * through unchanged.
   */
  const childWithA11y: React.ReactNode =
    hasError && React.isValidElement(children)
      ? React.cloneElement(
          children as React.ReactElement<Record<string, unknown>>,
          {
            "aria-invalid": true,
            "aria-describedby": describedBy,
            id,
          },
        )
      : hint && React.isValidElement(children)
        ? React.cloneElement(
            children as React.ReactElement<Record<string, unknown>>,
            {
              "aria-describedby": describedBy,
              id,
            },
          )
        : children;

  /*
   * 2. Slot the adornment next to the input, if one was supplied.
   *
   * When `trailingAdornment` is present we wrap the child + adornment in
   * a flex row. The child gets `flex-1` so it expands to fill the row
   * (merged with any existing className via `cn` / `twMerge`); the
   * adornment keeps its natural size.
   *
   * The wrapper is purely structural — it carries NO `aria-invalid`,
   * NO `aria-describedby`, NO role. Those live on the input itself,
   * which is the only element a screen reader should announce as the
   * field. Adding a11y attrs to the wrapper would cause screen readers
   * to announce the field twice.
   *
   * When no adornment is supplied, this step is a no-op: the child
   * remains a direct child of the FormField root, preserving the
   * pre-existing DOM contract.
   */
  const inputSlot: React.ReactNode = trailingAdornment
    ? (() => {
        const flexChild = React.isValidElement(childWithA11y)
          ? React.cloneElement(
              childWithA11y as React.ReactElement<Record<string, unknown>>,
              {
                className: cn(
                  "flex-1",
                  (childWithA11y as React.ReactElement<Record<string, unknown>>)
                    .props.className as string | undefined,
                ),
              },
            )
          : childWithA11y;
        return (
          <div className="flex items-center gap-2">
            {flexChild}
            {trailingAdornment}
          </div>
        );
      })()
    : childWithA11y;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        ) : null}
      </Label>

      {inputSlot}

      {hasError ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm font-normal text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm font-normal text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
