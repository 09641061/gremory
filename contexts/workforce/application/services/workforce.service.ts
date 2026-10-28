import type { WorkforceGateway } from "../ports/workforce-gateway";
import type { SaveWorkforceRole } from "../model/workforce";

export class WorkforceService {
  constructor(private readonly gateway: WorkforceGateway) {}

  listInvitations(accessToken: string, organizationId: string) {
    return this.gateway.listInvitations(accessToken, organizationId);
  }

  invite(accessToken: string, organizationId: string, input: { email: string; establishmentId: string; roleId: string }) {
    return this.gateway.invite(accessToken, organizationId, input);
  }

  resend(accessToken: string, organizationId: string, invitationId: string) {
    return this.gateway.resend(accessToken, organizationId, invitationId);
  }

  revoke(accessToken: string, organizationId: string, invitationId: string) {
    return this.gateway.revoke(accessToken, organizationId, invitationId);
  }

  preview(token: string) {
    return this.gateway.preview(token);
  }

  accept(accessToken: string, token: string) {
    return this.gateway.accept(accessToken, token);
  }

  listMembers(accessToken: string, organizationId: string) {
    return this.gateway.listMembers(accessToken, organizationId);
  }

  deactivateMember(accessToken: string, organizationId: string, membershipId: string) {
    return this.gateway.deactivateMember(accessToken, organizationId, membershipId);
  }

  listPermissions(accessToken: string, organizationId: string) { return this.gateway.listPermissions(accessToken, organizationId); }
  listRoles(accessToken: string, organizationId: string) { return this.gateway.listRoles(accessToken, organizationId); }
  getRole(accessToken: string, organizationId: string, roleId: string) { return this.gateway.getRole(accessToken, organizationId, roleId); }
  createRole(accessToken: string, organizationId: string, input: SaveWorkforceRole) { return this.gateway.createRole(accessToken, organizationId, input); }
  updateRole(accessToken: string, organizationId: string, roleId: string, input: SaveWorkforceRole) { return this.gateway.updateRole(accessToken, organizationId, roleId, input); }
  archiveRole(accessToken: string, organizationId: string, roleId: string, version: number) { return this.gateway.archiveRole(accessToken, organizationId, roleId, version); }
  assignMemberRole(accessToken: string, organizationId: string, membershipId: string, roleId: string) { return this.gateway.assignMemberRole(accessToken, organizationId, membershipId, roleId); }
  assignInvitationRole(accessToken: string, organizationId: string, invitationId: string, roleId: string) { return this.gateway.assignInvitationRole(accessToken, organizationId, invitationId, roleId); }
}
