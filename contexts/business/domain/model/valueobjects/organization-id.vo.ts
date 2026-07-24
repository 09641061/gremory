export type OrganizationId = Readonly<{ value: string }>;

export function createOrganizationId(value: string): OrganizationId {
  if (!value || !value.trim()) {
    throw new Error("OrganizationId is required");
  }
  return Object.freeze({ value });
}
