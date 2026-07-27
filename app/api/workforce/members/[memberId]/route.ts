import { removeWorkforceMemberRoute } from "@/contexts/workforce/interfaces/rest/routes/workforce.route";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const { memberId } = await params;
  return removeWorkforceMemberRoute(memberId);
}
