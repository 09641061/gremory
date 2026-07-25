export type OrganizationName = Readonly<{ value: string }>;

export function createOrganizationName(value: string): OrganizationName {
  const normalized = value.trim();
  if (!normalized) throw new Error("Organization name is required");
  if (normalized.length > 150) throw new Error("Organization name cannot exceed 150 characters");
  return Object.freeze({ value: normalized });
}
