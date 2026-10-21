"use server";

import { revalidatePath } from "next/cache";
import { createCrmApiGateway } from "../server/crm-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { createActionErrorId, type ActionState } from "./action-state";
import { CustomerResponse } from "../../application/models/customer";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

export async function updateCustomerNotesAction(
  customerId: string,
  establishmentId: string,
  notes: string,
): Promise<ActionState<CustomerResponse>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:update")) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to update customer notes.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const gateway = createCrmApiGateway(workspace.organization?.id);
    const result = await gateway.updateCustomerNotes(customerId, establishmentId, notes);
    try {
      revalidatePath("/crm");
    } catch {
      // Safe fallback
    }
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
      error: error instanceof ApiError ? error.message : "Failed to update customer notes.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}
