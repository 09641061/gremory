import {
  deleteWorkforceRoleRoute,
  patchWorkforceRoleRoute,
} from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  const { roleId } = await params;
  return patchWorkforceRoleRoute(request, roleId);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  const { roleId } = await params;
  return deleteWorkforceRoleRoute(roleId);
}
