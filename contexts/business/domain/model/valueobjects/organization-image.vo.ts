export type OrganizationImage = Readonly<{ value: string | null }>;

export function createOrganizationImage(value?: string | null): OrganizationImage {
  const normalized = value?.trim() || null;
  if (normalized && normalized.length > 500) {
    throw new Error("Organization image URL cannot exceed 500 characters");
  }
  return Object.freeze({ value: normalized });
}
