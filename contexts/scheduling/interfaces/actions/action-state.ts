export type ActionState<T> =
  | { status: "idle"; data: null; error: null; fieldErrors: null }
  | { status: "success"; data: T; error: null; fieldErrors: null }
  | {
      status: "error";
      data: null;
      error: string;
      errorId: string;
      fieldErrors: Record<string, string[]> | null;
    };
