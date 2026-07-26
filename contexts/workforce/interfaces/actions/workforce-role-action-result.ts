export type WorkforceRoleActionResult =
  | { status: "idle"; data: null; error: null }
  | {
      status: "success";
      data: { roleId?: string } | null;
      error: null;
    }
  | { status: "error"; data: null; error: string };

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
