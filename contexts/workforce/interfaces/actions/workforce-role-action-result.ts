import type { ActionResult } from "@/contexts/shared/interfaces/actions/action-result";

export type WorkforceRoleActionResult = ActionResult<
  { roleId?: string; name?: string; position?: number } | null
>;

export const initialWorkforceRoleActionResult: WorkforceRoleActionResult = {
  status: "idle",
  data: null,
  error: null,
};

export function workforceRoleActionError(error: unknown): WorkforceRoleActionResult {
  if (error instanceof Error) {
    return {
      status: "error",
      data: null,
      error: error.message,
    };
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return {
        status: "error",
        data: null,
        error: message,
      };
    }
  }

  return {
    status: "error",
    data: null,
    error: "Unexpected error",
  };
}
