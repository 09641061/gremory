export interface ActionState<T> {
  status: "idle" | "success" | "error";
  data: T | null;
  error: string | null;
  errorId: string | null;
  fieldErrors: Record<string, string[]> | null;
}

export function createActionErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
