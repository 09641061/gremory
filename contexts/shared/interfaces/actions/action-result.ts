/**
 * Common shape for `useActionState`-driven Server Actions: an idle state before
 * submission, a success state carrying the action's payload, and an error state
 * carrying a message. Contexts with this exact shape should alias their
 * `*ActionResult` type to this generic instead of redeclaring the union.
 */
export type ActionResult<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export function initialActionResult<T>(): ActionResult<T> {
  return { status: "idle", data: null, error: null };
}

export function actionResultError<T>(error: unknown): ActionResult<T> {
  return {
    status: "error",
    data: null,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
}
