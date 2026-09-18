export type ActionFieldErrors = Record<string, string[]> | null;

export type ActionState<TData, TFieldErrors extends ActionFieldErrors = ActionFieldErrors> =
  | {
      status: "idle";
      data: null;
      error: null;
      errorId?: null;
      fieldErrors: null;
    }
  | {
      status: "success";
      data: TData;
      error: null;
      errorId?: null;
      fieldErrors: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
      errorId: string;
      fieldErrors: TFieldErrors;
    };

export function createIdleActionState<TData, TFieldErrors extends ActionFieldErrors = ActionFieldErrors>(): ActionState<
  TData,
  TFieldErrors
> {
  return {
    status: "idle",
    data: null,
    error: null,
    errorId: null,
    fieldErrors: null,
  };
}

export function createSuccessActionState<TData, TFieldErrors extends ActionFieldErrors = ActionFieldErrors>(
  data: TData,
): ActionState<TData, TFieldErrors> {
  return {
    status: "success",
    data,
    error: null,
    errorId: null,
    fieldErrors: null,
  };
}

export function createErrorActionState<TData, TFieldErrors extends ActionFieldErrors = ActionFieldErrors>(
  error: string,
  fieldErrors: TFieldErrors = null as TFieldErrors,
  errorId = createActionErrorId(),
): ActionState<TData, TFieldErrors> {
  return {
    status: "error",
    data: null,
    error,
    errorId,
    fieldErrors,
  };
}

export function createActionErrorId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
