import "server-only";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { OperationAuthorizationError, requireAuthenticatedToken } from "@/contexts/shared/interfaces/authorization/operation-authorization";
export async function requireAnalyticsContext(establishmentId?:string){ const token=await requireAuthenticatedToken(); const w=await createBusinessWorkspaceQueryService().getHeaderViewModel({establishmentId}); const id=establishmentId??w.activeEstablishmentId; const e=getWorkspaceEstablishment(w,id); if(!e||!hasEstablishmentPermission(e,"analytics:read")) throw new OperationAuthorizationError("FORBIDDEN"); return {token,organizationId:w.organization?.id,establishmentId:e.id}; }
