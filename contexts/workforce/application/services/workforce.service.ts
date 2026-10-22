import type { WorkforceGateway } from "../ports/workforce-gateway";

export class WorkforceService {
  constructor(private readonly gateway: WorkforceGateway) {}

  listInvitations(accessToken: string, organizationId: string) {
    return this.gateway.listInvitations(accessToken, organizationId);
  }

  invite(accessToken: string, organizationId: string, input: { email: string; establishmentId: string }) {
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
}
