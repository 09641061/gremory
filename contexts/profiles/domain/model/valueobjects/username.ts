export type Username = Readonly<{ value: string }>;

export function createUsername(value: string): Username {
  if (!value || !value.trim()) {
    throw new Error("Username is required");
  }
  if (!/^[a-zA-Z]+$/.test(value)) {
    throw new Error("Username must contain only letters (A-Z, a-z) without numbers, spaces, accents, or special characters");
  }
  return Object.freeze({ value });
}
