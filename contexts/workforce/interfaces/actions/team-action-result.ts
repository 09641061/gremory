import type { ActionResult } from "@/contexts/shared/interfaces/actions/action-result";

export type TeamActionResult = ActionResult<{ invitationId?: string; memberId?: string } | null>;

export const initialTeamActionResult: TeamActionResult = {
  status: "idle",
  data: null,
  error: null,
};

export function teamActionError(error: unknown): TeamActionResult {
  return {
    status: "error",
    data: null,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
}
