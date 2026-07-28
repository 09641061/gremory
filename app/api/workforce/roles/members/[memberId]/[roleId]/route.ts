import { removeWorkforceRoleAssignmentRoute } from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ memberId: string; roleId: string }> },
) {
  const { memberId, roleId } = await params;
  return removeWorkforceRoleAssignmentRoute(memberId, roleId);
}
