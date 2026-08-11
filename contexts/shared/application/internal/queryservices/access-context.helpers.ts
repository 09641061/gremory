import "server-only";

export function pickActiveEstablishment<T extends { establishmentId: string }>(
  establishments: ReadonlyArray<T>,
  activeEstablishmentId?: string,
): T | undefined {
  return establishments.find((item) => item.establishmentId === activeEstablishmentId) ?? establishments[0];
}

export function findFirstMatchingEstablishment<T>(
  establishments: ReadonlyArray<T>,
  predicate: (establishment: T) => boolean,
): T | undefined {
  return establishments.find(predicate);
}

export function hasAnyPermission(
  permissions: ReadonlyArray<string>,
  allowed: ReadonlyArray<string>,
): boolean {
  return allowed.some((permission) => permissions.includes(permission));
}
