import "server-only";
import { z } from "zod";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { requireAuthenticatedToken, OperationAuthorizationError } from "@/contexts/shared/interfaces/authorization/operation-authorization";
const idSchema = z.string().uuid();
export async function requireEstablishmentCapability(id: string, capability: "canRead"|"canUpdate"|"canDelete") {
 const token=await requireAuthenticatedToken(); if(!idSchema.safeParse(id).success) throw new OperationAuthorizationError("INVALID_RESOURCE");
 const workspace=await createBusinessWorkspaceQueryService().getHeaderViewModel({establishmentId:id}); const item=getWorkspaceEstablishment(workspace,id);
 if(!item || item[capability]!==true) throw new OperationAuthorizationError("FORBIDDEN");
 return {token,organizationId:workspace.organization?.id,establishmentId:id};
}
export async function requireOrganizationCapability(id:string, capability:"canRead"|"canUpdate") {
 const token=await requireAuthenticatedToken(); if(!idSchema.safeParse(id).success) throw new OperationAuthorizationError("INVALID_RESOURCE");
 const workspace=await createBusinessWorkspaceQueryService().getHeaderViewModel();
 if(workspace.organization?.id!==id || workspace.organization[capability]!==true) throw new OperationAuthorizationError("FORBIDDEN");
 return {token,organizationId:id};
}
