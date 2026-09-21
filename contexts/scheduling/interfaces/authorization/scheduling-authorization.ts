import "server-only";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { composeSchedulingAdapters } from "@/contexts/scheduling/interfaces/server/scheduling-composition";
import { OperationAuthorizationError, requireAuthenticatedToken } from "@/contexts/shared/interfaces/authorization/operation-authorization";
export async function requireAppointmentOperationAuthorization(id: string, permission = "scheduling:manage") {
  const token = await requireAuthenticatedToken();
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel();
  const establishment = getWorkspaceEstablishment(workspace, workspace.activeEstablishmentId);
  if (!establishment || !hasEstablishmentPermission(establishment, permission)) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  const appointment = await composeSchedulingAdapters(workspace.organization?.id).queryService.getAppointment(id, token);
  if (appointment.establishmentId !== establishment.id) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return { token, organizationId: workspace.organization?.id, establishmentId: establishment.id };
}
export async function requireSchedulingContext(permission = "scheduling:manage", requestedEstablishmentId?: string) {
  const token = await requireAuthenticatedToken();
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({
    establishmentId: requestedEstablishmentId,
  });
  const id = requestedEstablishmentId ?? workspace.activeEstablishmentId;
  const establishment = getWorkspaceEstablishment(workspace, id);
  if (!establishment || !hasEstablishmentPermission(establishment, permission)) {
    throw new OperationAuthorizationError("FORBIDDEN");
  }
  return { token, organizationId: workspace.organization?.id, establishmentId: establishment.id };
}
