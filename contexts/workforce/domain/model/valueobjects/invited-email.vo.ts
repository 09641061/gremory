export type InvitedEmail = Readonly<{ value: string }>;

export function createInvitedEmail(value: string): InvitedEmail {
  const normalized = value.trim().toLowerCase();
  if (
    normalized.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
  ) {
    throw new Error("A valid invited email is required");
  }
  return Object.freeze({ value: normalized });
}
