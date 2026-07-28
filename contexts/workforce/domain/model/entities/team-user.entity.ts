import type { WorkforceUserStatus } from "../enums/workforce-user-status";
import type { InvitedEmail } from "../valueobjects/invited-email.vo";
import type {
  InvitationId,
  MemberId,
  TeamEstablishmentId,
  TeamOrganizationId,
  TeamRoleId,
  TeamUserId,
} from "../valueobjects/team-identifiers.vo";

export interface TeamUserProps {
  invitationId: InvitationId;
  memberId: MemberId | null;
  userId: TeamUserId | null;
  email: InvitedEmail;
  roleId?: TeamRoleId;
  roleName?: string;
  roles?: ReadonlyArray<TeamRoleSummary>;
  organizationId: TeamOrganizationId;
  establishmentId: TeamEstablishmentId;
  establishmentName: string | null;
  status: WorkforceUserStatus;
  invitedAt: Date;
  invitationExpiresAt: Date;
  acceptedAt: Date | null;
  joinedAt: Date | null;
  removedAt: Date | null;
}

export interface TeamRoleSummary {
  id: TeamRoleId;
  name: string;
  position: number;
  systemRole: boolean;
  permissions: ReadonlyArray<string>;
}

export class TeamUser {
  private constructor(
    public readonly invitationId: InvitationId,
    public readonly memberId: MemberId | null,
    public readonly userId: TeamUserId | null,
    public readonly email: InvitedEmail,
    public readonly roleId: TeamRoleId,
    public readonly roleName: string,
    public readonly roles: ReadonlyArray<TeamRoleSummary>,
    public readonly organizationId: TeamOrganizationId,
    public readonly establishmentId: TeamEstablishmentId,
    public readonly establishmentName: string | null,
    public readonly status: WorkforceUserStatus,
    public readonly invitedAt: Date,
    public readonly invitationExpiresAt: Date,
    public readonly acceptedAt: Date | null,
    public readonly joinedAt: Date | null,
    public readonly removedAt: Date | null,
  ) {}

  static create(props: TeamUserProps): TeamUser {
    if (
      (props.status === "ACTIVE" || props.status === "REMOVED") &&
      (!props.memberId || !props.userId)
    ) {
      throw new Error(`${props.status} team users require member and user IDs`);
    }
    if (Number.isNaN(props.invitedAt.getTime()) || Number.isNaN(props.invitationExpiresAt.getTime())) {
      throw new Error("Team user invitation dates must be valid");
    }
    const roles = [...(props.roles ?? (props.roleId && props.roleName ? [{
      id: props.roleId,
      name: props.roleName,
      position: 2_147_483_647,
      systemRole: true,
      permissions: [],
    }] : []))];
    const primaryRole = roles[0];
    if (!primaryRole) throw new Error("Team users require at least Everyone role");
    return new TeamUser(
      props.invitationId,
      props.memberId,
      props.userId,
      props.email,
      primaryRole.id,
      primaryRole.name.trim(),
      Object.freeze(roles),
      props.organizationId,
      props.establishmentId,
      normalizeEstablishmentName(props.establishmentName),
      props.status,
      props.invitedAt,
      props.invitationExpiresAt,
      props.acceptedAt,
      props.joinedAt,
      props.removedAt,
    );
  }

  get hasAcceptedInvitation(): boolean {
    return this.status === "ACTIVE" || this.status === "REMOVED";
  }

  get canRevokeInvitation(): boolean {
    return this.status === "PENDING";
  }

  get canRemoveMembership(): boolean {
    return this.status === "ACTIVE" && this.memberId !== null;
  }
}

function normalizeEstablishmentName(value: string | null): string | null {
  if (value === null) return null;
  const normalized = value.trim();
  return normalized || null;
}
