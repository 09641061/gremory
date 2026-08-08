import "server-only";

type RoleLike = Readonly<{
  name: string;
}>;

type EstablishmentLike = Readonly<{
  establishmentId: string;
  roles?: ReadonlyArray<RoleLike>;
  effectivePermissions: ReadonlyArray<string>;
}>;

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

export function hasReadRole(roles?: ReadonlyArray<RoleLike>): boolean {
  return roles?.some((role) => role.name.toLowerCase() === "read") ?? false;
}

export function hasAnyPermission(
  permissions: ReadonlyArray<string>,
  allowed: ReadonlyArray<string>,
): boolean {
  return allowed.some((permission) => permissions.includes(permission));
}

export function hasAnyAccessibleRole(establishment: EstablishmentLike): boolean {
  return hasReadRole(establishment.roles);
}
