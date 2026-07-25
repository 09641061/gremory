export type EstablishmentName = Readonly<{ value: string }>;

export function createEstablishmentName(value: string): EstablishmentName {
  const normalized = value.trim();
  if (!normalized) throw new Error("Establishment name is required");
  if (normalized.length > 100) throw new Error("Establishment name cannot exceed 100 characters");
  return Object.freeze({ value: normalized });
}
