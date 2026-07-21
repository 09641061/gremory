export type Email = Readonly<{ value: string }>;

export function createEmail(value: string): Email {
  const normalized = value.trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    throw new Error("A valid email is required");
  }

  return Object.freeze({ value: normalized });
}
