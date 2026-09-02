export const MIN_ORGANIZATION_NAME_LENGTH = 3;
export const MAX_ORGANIZATION_NAME_LENGTH = 20;
export const ORGANIZATION_NAME_REGEX = /^[a-zA-Z]+$/;

export type OrganizationName = Readonly<{ value: string }>;

export function createOrganizationName(value: string): OrganizationName {
  if (!value || !value.trim()) {
    throw new Error("Organization name is required");
  }

  const normalized = value.trim();

  if (normalized.length < MIN_ORGANIZATION_NAME_LENGTH || normalized.length > MAX_ORGANIZATION_NAME_LENGTH) {
    throw new Error(
      `Organization name must be between ${MIN_ORGANIZATION_NAME_LENGTH} and ${MAX_ORGANIZATION_NAME_LENGTH} characters`
    );
  }

  if (!ORGANIZATION_NAME_REGEX.test(normalized)) {
    throw new Error("Organization name must contain only letters (A-Z, a-z)");
  }

  return Object.freeze({ value: normalized });
}

