"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button, type buttonVariants } from "@/contexts/shared/interfaces/components/ui/button";
import type { VariantProps } from "class-variance-authority";

/**
 * FormSubmitButton — submit button with automatic loading state.
 *
 * Why a wrapper?
 * --------------
 * Three of the audited forms (customer, edit-service, create-category)
 * repeat the same pattern:
 *
 *   <Button type="submit" disabled={isSaving}>
 *     {isSaving ? <Loader2 className="size-4 animate-spin" /> : submitIcon}
 *     {submitLabel}
 *   </Button>
 *
 * Wrapping it once keeps the spinner class name and `aria-busy`/disabled
 * behaviour consistent and makes the loading-state assertion
 * (`expect(submit).toBeDisabled(); expect(submit.querySelector('.animate-spin'))`)
 * stable across forms.
 *
 * Loading state contract
 * ----------------------
 * - When `isSubmitting` is `true`:
 *     - the button is `disabled`
 *     - `aria-busy="true"` is set so screen readers announce the in-flight state
 *     - a `Loader2` spinner renders on the LEFT of the label
 *     - any leading `icon` is suppressed (the spinner replaces it)
 * - When `isSubmitting` is `false`:
 *     - the button is enabled
 *     - `aria-busy="false"` is set
 *     - the leading `icon` (if any) renders
 *
 * The button type is fixed to `"submit"`: this component is meaningless
 * outside a `<form>` and forcing the type prevents the silent footgun of
 * pasting it without `type="submit"`.
 */
export interface FormSubmitButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "type" | "children"> {
  /** While `true`, disables the button and shows a spinner. */
  isSubmitting: boolean;
  /** Visible button label (already translated). */
  children: React.ReactNode;
  /** Optional leading icon (e.g. Save / Plus). Hidden while submitting. */
  icon?: React.ReactNode;
  /**
   * Visual variant — forwarded to the underlying Button primitive. Defaults
   * to `"default"` so a stray `<FormSubmitButton />` is still a usable
   * submit button.
   */
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function FormSubmitButton({
  isSubmitting,
  children,
  icon,
  variant,
  disabled,
  className,
  ...rest
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={isSubmitting || disabled}
      aria-busy={isSubmitting}
      className={className}
      {...rest}
    >
      {isSubmitting ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : icon ? (
        <span aria-hidden="true">{icon}</span>
      ) : null}
      {children}
    </Button>
  );
}
