import { revokeWorkforceInvitationRoute } from "@/contexts/workforce/interfaces/rest/routes/workforce.route";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  const { invitationId } = await params;
  return revokeWorkforceInvitationRoute(invitationId);
}
