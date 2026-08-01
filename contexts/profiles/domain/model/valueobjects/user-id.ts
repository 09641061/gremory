export type UserId = Readonly<{ value: string }>;

export function createUserId(value: string): UserId {
  if (!value || !value.trim()) {
    throw new Error("UserId is required");
  }
  return Object.freeze({ value });
}
