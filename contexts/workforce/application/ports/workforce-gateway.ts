import type {
  AcceptedWorkforceInvitation,
  WorkforceInvitation,
  WorkforceInvitationPreview,
  WorkforceMember,
} from "../model/workforce";

export interface WorkforceGateway {
  listInvitations(accessToken: string, organizationId: string): Promise<readonly WorkforceInvitation[]>;
  invite(accessToken: string, organizationId: string, input: { email: string; establishmentId: string }): Promise<WorkforceInvitation>;
  resend(accessToken: string, organizationId: string, invitationId: string): Promise<WorkforceInvitation>;
  revoke(accessToken: string, organizationId: string, invitationId: string): Promise<void>;
  preview(token: string): Promise<WorkforceInvitationPreview>;
  accept(accessToken: string, token: string): Promise<AcceptedWorkforceInvitation>;
  listMembers(accessToken: string, organizationId: string): Promise<readonly WorkforceMember[]>;
  deactivateMember(accessToken: string, organizationId: string, membershipId: string): Promise<void>;
}
