"use client";

import * as React from "react";

/**
 * useFormSubmit — Double-submit guard for client-side forms.
 *
 * Why a hook and not a Context?
 * -----------------------------
 * Each form has its own submission lifecycle (click → validate → submit →
 * server response → settle), so a context would only add boilerplate. A
 * hook keeps the state scoped to the form component that calls it and lets
 * every form own its own in-flight flag.
 *
 * Why a hook and not `useTransition`?
 * ----------------------------------
 * `useTransition` covers transitions that React itself drives (Suspense,
 * Server Actions). Plain imperative submit handlers — the kind a form
 * component writes for its own validation + manual `onSubmit(data)` call —
 * are out of its scope. This hook gives the same shape (`isSubmitting` +
 * a wrapping function) for that imperative case, and exposes `guard()`
 * for the synchronous "should I early-return?" check that runs BEFORE the
 * async submit (e.g. between event-handler invocations on the same render).
 *
 * State model
 * -----------
 * Two flags back the hook, on purpose:
 *
 *   - `isSubmitting` (React state) drives re-renders so consumers can
 *     disable a submit button or show a spinner.
 *   - `submittingRef` (mutable ref) lets `submit()` and `guard()` read
 *     the current value synchronously, without waiting for a re-render.
 *     This is what prevents the second click that fires BEFORE React has
 *     committed the new `isSubmitting=true` from slipping through.
 *
 * Both flags are updated together inside `submit()`. The ref is also the
 * source of truth inside the `finally` block so a callback that throws
 * still flips both back to `false`.
 *
 * Unmount safety
 * --------------
 * `mountedRef` is flipped to `false` on unmount via the `useEffect`
 * cleanup. `submit()` skips `setIsSubmitting` when the component is
 * unmounted (calling `setState` after unmount triggers a React warning
 * and, since React 18, can no-op silently in concurrent renders). The
 * ref and the callback always run regardless of mount state, so a
 * in-flight submission that finishes after unmount still settles the
 * hook's internal state and any subsequent `submit()` calls correctly
 * observe it.
 *
 * SSR safety
 * ----------
 * The hook only calls React built-ins (`useState`, `useRef`, `useEffect`)
 * — no `window` or DOM access. `useEffect` does not run on the server,
 * so `mountedRef` stays at its initial `true` value during SSR and the
 * initial render matches the server-rendered HTML on hydration.
 *
 * Stable identity
 * ---------------
 * The returned `submit` and `guard` are wrapped in `useCallback` so they
 * are safe to put in a `useEffect` dependency list without retriggering.
 * Their identities never change for the lifetime of the component.
 */
export interface UseFormSubmitResult {
  /**
   * UI-facing submitting state. Updates trigger a re-render so consumers
   * can disable a submit button or swap the label for a spinner.
   */
  isSubmitting: boolean;
  /**
   * Runs `fn` only if no submission is currently in flight. Returns
   * `true` when the callback was executed, `false` when it was skipped
   * because a previous `submit()` call is still running.
   *
   * The callback may be synchronous or return a Promise; both shapes are
   * awaited and any thrown error is swallowed by the `finally` block so
   * the hook always returns to its idle state.
   */
  submit: <T>(fn: () => T | Promise<T>) => Promise<boolean>;
  /**
   * Synchronous read of the in-flight flag. Useful for early-return
   * checks inside event handlers that should bail out without paying the
   * cost of constructing a Promise.
   */
  guard: () => boolean;
}

export function useFormSubmit(initialSubmitting = false): UseFormSubmitResult {
  const [isSubmitting, setIsSubmitting] = React.useState(initialSubmitting);
  // Refs keep the synchronous source-of-truth for `submit` and `guard`.
  // `submittingRef` mirrors the React state but updates immediately, so a
  // second call inside the same render tick still sees the new value.
  // `mountedRef` gates `setIsSubmitting` after unmount to avoid the React
  // "setState on unmounted component" warning.
  const submittingRef = React.useRef(initialSubmitting);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const submit = React.useCallback(
    async <T,>(fn: () => T | Promise<T>): Promise<boolean> => {
      // Re-entry guard: a previous `submit()` is still awaiting its
      // callback. Skipping here is what protects the form from a rapid
      // double-click, a stale handler firing twice, or any other path
      // that would otherwise call `onSubmit(data)` twice.
      if (submittingRef.current) {
        return false;
      }
      submittingRef.current = true;
      if (mountedRef.current) {
        setIsSubmitting(true);
      }
      try {
        await fn();
        return true;
      } finally {
        // The ref is always updated so internal invariants hold even if
        // the component unmounts during `await fn()`. The setState is
        // gated on `mountedRef` to avoid the post-unmount warning.
        submittingRef.current = false;
        if (mountedRef.current) {
          setIsSubmitting(false);
        }
      }
    },
    [],
  );

  const guard = React.useCallback((): boolean => submittingRef.current, []);

  return { isSubmitting, submit, guard };
}
