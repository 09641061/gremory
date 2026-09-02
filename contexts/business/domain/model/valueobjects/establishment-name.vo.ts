export const MIN_ESTABLISHMENT_NAME_LENGTH = 3;
export const MAX_ESTABLISHMENT_NAME_LENGTH = 20;
export const ESTABLISHMENT_NAME_REGEX = /^[a-zA-Z]+$/;

export type EstablishmentName = Readonly<{ value: string }>;

export function createEstablishmentName(value: string): EstablishmentName {
  if (!value || !value.trim()) {
    throw new Error("Establishment name is required");
  }

  const normalized = value.trim();

  if (normalized.length < MIN_ESTABLISHMENT_NAME_LENGTH || normalized.length > MAX_ESTABLISHMENT_NAME_LENGTH) {
    throw new Error(
      `Establishment name must be between ${MIN_ESTABLISHMENT_NAME_LENGTH} and ${MAX_ESTABLISHMENT_NAME_LENGTH} characters`
    );
  }

  if (!ESTABLISHMENT_NAME_REGEX.test(normalized)) {
    throw new Error("Establishment name must contain only letters (A-Z, a-z)");
  }

  return Object.freeze({ value: normalized });
}

