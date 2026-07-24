export type EstablishmentId = Readonly<{ value: string }>;

export function createEstablishmentId(value: string): EstablishmentId {
  if (!value || !value.trim()) {
    throw new Error("EstablishmentId is required");
  }
  return Object.freeze({ value });
}
