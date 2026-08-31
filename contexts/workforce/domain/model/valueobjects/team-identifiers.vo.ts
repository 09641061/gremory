export type InvitationId = Readonly<{ value: string }>;
export type MemberId = Readonly<{ value: string }>;
export type TeamUserId = Readonly<{ value: string }>;
export type TeamOrganizationId = Readonly<{ value: string }>;
export type TeamEstablishmentId = Readonly<{ value: string }>;
export type TeamRoleId = Readonly<{ value: string }>;


export function createInvitationId(value: string): InvitationId {
  return Object.freeze({ value: requireUuid(value, "Invitation ID") });
}

export function createMemberId(value: string): MemberId {
  return Object.freeze({ value: requireUuid(value, "Member ID") });
}

export function createTeamUserId(value: string): TeamUserId {
  return Object.freeze({ value: requireUuid(value, "Team user ID") });
}

export function createTeamOrganizationId(value: string): TeamOrganizationId {
  return Object.freeze({ value: requireUuid(value, "Organization ID") });
}

export function createTeamEstablishmentId(value: string): TeamEstablishmentId {
  return Object.freeze({ value: requireUuid(value, "Establishment ID") });
}

export function createTeamRoleId(value: string): TeamRoleId {
  return Object.freeze({ value: requireUuid(value, "Role ID") });
}


function requireUuid(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${field} is required`);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(normalized)) {
    throw new Error(`${field} must be a valid UUID`);
  }
  return normalized;
}
