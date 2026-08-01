export type ProfileId = Readonly<{ value: string }>;

export function createProfileId(value: string): ProfileId {
  if (!value || !value.trim()) {
    throw new Error("ProfileId is required");
  }
  return Object.freeze({ value });
}
