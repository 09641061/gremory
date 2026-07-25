export type TeamActionResult =
  | { status: "idle"; data: null; error: null }
  | {
      status: "success";
      data: { invitationId?: string; memberId?: string } | null;
      error: null;
    }
  | { status: "error"; data: null; error: string };

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
