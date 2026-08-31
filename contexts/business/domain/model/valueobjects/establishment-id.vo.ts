export type EstablishmentId = Readonly<{ value: string }>;

export function createEstablishmentId(value: string): EstablishmentId {
  const normalized = value.trim();
  if (!normalized) throw new Error("Establishment ID is required");
  if (!isUuid(normalized)) throw new Error("Establishment ID must be a valid UUID");
  return Object.freeze({ value: normalized });
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
