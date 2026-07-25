export type BusinessActionResult =
  | { status: "idle"; data: null; error: null }
  | { status: "success"; data: { id?: string } | null; error: null }
  | { status: "error"; data: null; error: string };

export const initialBusinessActionResult: BusinessActionResult = {
  status: "idle",
  data: null,
  error: null,
};

export function actionError(error: unknown): BusinessActionResult {
  return {
    status: "error",
    data: null,
    error: error instanceof Error ? error.message : "Unexpected error",
  };
}
