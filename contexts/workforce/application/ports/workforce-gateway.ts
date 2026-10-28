import type {
  AcceptedWorkforceInvitation,
  WorkforceInvitation,
  WorkforceInvitationPreview,
  WorkforceMember,
  WorkforcePermissionDefinition,
  WorkforceRole,
  SaveWorkforceRole,
} from "../model/workforce";

export interface WorkforceGateway {
  listInvitations(accessToken: string, organizationId: string): Promise<readonly WorkforceInvitation[]>;
  invite(accessToken: string, organizationId: string, input: { email: string; establishmentId: string; roleId: string }): Promise<WorkforceInvitation>;
  resend(accessToken: string, organizationId: string, invitationId: string): Promise<WorkforceInvitation>;
  revoke(accessToken: string, organizationId: string, invitationId: string): Promise<void>;
  preview(token: string): Promise<WorkforceInvitationPreview>;
  accept(accessToken: string, token: string): Promise<AcceptedWorkforceInvitation>;
  listMembers(accessToken: string, organizationId: string): Promise<readonly WorkforceMember[]>;
  deactivateMember(accessToken: string, organizationId: string, membershipId: string): Promise<void>;
  listPermissions(accessToken: string, organizationId: string): Promise<readonly WorkforcePermissionDefinition[]>;
  listRoles(accessToken: string, organizationId: string): Promise<readonly WorkforceRole[]>;
  getRole(accessToken: string, organizationId: string, roleId: string): Promise<WorkforceRole>;
  createRole(accessToken: string, organizationId: string, input: SaveWorkforceRole): Promise<WorkforceRole>;
  updateRole(accessToken: string, organizationId: string, roleId: string, input: SaveWorkforceRole): Promise<WorkforceRole>;
  archiveRole(accessToken: string, organizationId: string, roleId: string, version: number): Promise<void>;
  assignMemberRole(accessToken: string, organizationId: string, membershipId: string, roleId: string): Promise<WorkforceMember>;
  assignInvitationRole(accessToken: string, organizationId: string, invitationId: string, roleId: string): Promise<WorkforceInvitation>;
}
