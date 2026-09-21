"use server";

import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../server/crm-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { createActionErrorId, type ActionState } from "./action-state";
import { deleteCustomerInputSchema } from "../schemas/action-input.schema";

export async function deleteCustomerAction(
  id: string,
  establishmentId: string
): Promise<ActionState<void>> {
  const parsed = deleteCustomerInputSchema.safeParse({ id, establishmentId });
  if (!parsed.success) {
    return { status: "error", data: null, error: "Invalid customer identifier.", errorId: createActionErrorId(), fieldErrors: null };
  }
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:manage")) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to delete customers.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
    await service.deleteCustomer(parsed.data);

    try {
      revalidatePath("/crm");
    } catch {
      // The backend write is already confirmed; cache invalidation is best effort.
    }
    return { status: "success", data: undefined, error: null, errorId: null, fieldErrors: null };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: safePublicError(error, "An error occurred while deleting the customer.").message,
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }
}
