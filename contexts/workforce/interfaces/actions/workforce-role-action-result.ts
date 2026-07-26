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
  return {
    status: "error",
    data: null,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
}
