export type ProfileImageUrl = Readonly<{ value: string | null }>;

export function createProfileImageUrl(value?: string | null): ProfileImageUrl {
  if (!value || !value.trim()) {
    return Object.freeze({ value: null });
  }
  return Object.freeze({ value: value.trim() });
}
