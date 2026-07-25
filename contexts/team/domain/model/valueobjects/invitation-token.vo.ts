export type InvitationToken = Readonly<{ value: string }>;

export function createInvitationToken(value: string): InvitationToken {
  const normalized = value.trim();
  if (!normalized) throw new Error("Invitation token is required");
  if (normalized.length > 2048) throw new Error("Invitation token is too long");
  return Object.freeze({ value: normalized });
}
