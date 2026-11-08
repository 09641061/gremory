"use server";

import { createCrmApiGateway } from "../server/crm-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { createActionErrorId, type ActionState } from "./action-state";
import type { CustomerOverviewViewModel } from "../../application/models/customer";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

export async function getCustomerOverviewAction(
  customerId: string,
  establishmentId: string,
): Promise<ActionState<CustomerOverviewViewModel>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:read")) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to view customer overview.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createCrmApiGateway(workspace.organization?.id);
    const result = await gateway.getCustomerOverview(customerId, establishmentId);
    return {
      status: "success",
      data: result,
      error: null,
      errorId: null,
      fieldErrors: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: error instanceof ApiError ? error.message : "Failed to load customer overview.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}
