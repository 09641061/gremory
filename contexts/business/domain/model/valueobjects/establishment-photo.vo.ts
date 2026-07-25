export type EstablishmentPhoto = Readonly<{ value: string | null }>;

export function createEstablishmentPhoto(value?: string | null): EstablishmentPhoto {
  const normalized = value?.trim() || null;
  if (normalized && normalized.length > 500) {
    throw new Error("Establishment photo URL cannot exceed 500 characters");
  }
  return Object.freeze({ value: normalized });
}
