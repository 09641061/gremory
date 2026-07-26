import {
  deleteWorkforceRoleRoute,
  updateWorkforceRoleRoute,
} from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  const { roleId } = await params;
  return updateWorkforceRoleRoute(request, roleId);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  const { roleId } = await params;
  return deleteWorkforceRoleRoute(roleId);
}
