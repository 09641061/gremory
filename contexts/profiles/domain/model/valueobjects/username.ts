export const MIN_USERNAME_LENGTH = 3;
export const MAX_USERNAME_LENGTH = 20;
export const USERNAME_REGEX = /^[a-zA-Z]+$/;

export type Username = Readonly<{ value: string }>;

export function createUsername(value: string): Username {
  if (!value || !value.trim()) {
    throw new Error("Username is required");
  }

  const trimmed = value.trim();

  if (trimmed.length < MIN_USERNAME_LENGTH || trimmed.length > MAX_USERNAME_LENGTH) {
    throw new Error(
      `Username must be between ${MIN_USERNAME_LENGTH} and ${MAX_USERNAME_LENGTH} characters`
    );
  }

  if (!USERNAME_REGEX.test(trimmed)) {
    throw new Error("Username must contain only letters (A-Z, a-z)");
  }

  return Object.freeze({ value: trimmed });
}

