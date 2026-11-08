"use client";

import * as React from "react";

/**
 * useFormValidation — stateful per-field error map for forms.
 *
 * Why a hook and not a Context?
 * -----------------------------
 * Each form has its own error lifecycle (validate → submit → success/error),
 * so a context would only add boilerplate. A hook keeps the state scoped to
 * the form component that calls it and lets every form own its own reducer
 * of `errors`. The hook exposes just the operations a form needs — no
 * imperative `setErrors({...})` ceremony.
 *
 * Contract
 * --------
 * - `errors` is a `Record<string, string | undefined>`. A missing key means
 *   "no error for this field"; an explicit `undefined` value is treated the
 *   same as a missing key by `hasErrors`. Storing strings (rather than
 *   `{message, code}` objects) keeps the API aligned with the FormField
 *   component's `error?: string` prop.
 * - `setError(field, message)` REPLACES the previous error for that field
 *   (or no-ops when the message is `null`/`undefined`, so callers don't
 *   need to guard before calling).
 * - `clearError(field)` removes the entry for that field.
 * - `clearAll()` removes every entry — useful between submissions.
 * - `hasErrors` is recomputed on every render so consumers can use it as a
 *   stable boolean dependency (e.g. to gate the submit button).
 *
 * Stable identity
 * ---------------
 * The returned handlers are wrapped in `useCallback` so they're safe to put
 * in a `useEffect` dependency list. Their identities only change when the
 * `initialErrors` reference changes — which is the contract a form
 * component already follows for `useState` initializers.
 */
export type FormErrors = Record<string, string | undefined>;

export interface UseFormValidationResult {
  errors: FormErrors;
  setError: (field: string, message: string | null | undefined) => void;
  clearError: (field: string) => void;
  clearAll: () => void;
  hasErrors: boolean;
}

export function useFormValidation(
  initialErrors: FormErrors = {},
): UseFormValidationResult {
  const [errors, setErrors] = React.useState<FormErrors>(initialErrors);

  const setError = React.useCallback(
    (field: string, message: string | null | undefined) => {
      if (message == null || message === "") {
        // Treat nullish/empty as "no error" so callers can blindly forward
        // every validator result without branching.
        setErrors((prev) => {
          if (!(field in prev)) return prev;
          // Build a new object without `field`; spreading + delete keeps the
          // type narrowing explicit without an unused-destructuring warning.
          const next: FormErrors = { ...prev };
          delete next[field];
          return next;
        });
        return;
      }
      setErrors((prev) => (prev[field] === message ? prev : { ...prev, [field]: message }));
    },
    [],
  );

  const clearError = React.useCallback((field: string) => {
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next: FormErrors = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = React.useCallback(() => {
    setErrors((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const hasErrors = React.useMemo(
    () => Object.values(errors).some((message) => Boolean(message)),
    [errors],
  );

  return { errors, setError, clearError, clearAll, hasErrors };
}
