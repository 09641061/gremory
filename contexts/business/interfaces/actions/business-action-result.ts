import type { ActionResult } from "@/contexts/shared/interfaces/actions/action-result";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";

export type BusinessActionResult = ActionResult<{ id?: string } | null>;

export const initialBusinessActionResult: BusinessActionResult = {
  status: "idle",
  data: null,
  error: null,
};

export function actionError(error: unknown): BusinessActionResult {
  return {
    status: "error",
    data: null,
    error: safePublicError(error).message,
  };
}
