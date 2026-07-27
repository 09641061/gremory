import { assignWorkforceRoleRoute } from "@/contexts/workforce/interfaces/rest/routes/workforce-role.route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  return assignWorkforceRoleRoute(request, memberId);
}
