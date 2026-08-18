"use server";

import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { ActionState } from "./register-customer.action";

export async function deleteCustomerAction(
  id: string,
  establishmentId: string
): Promise<ActionState<void>> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:manage")) {
    return { status: "error", data: null, error: "You are not authorized to delete customers." };
  }

  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
    await service.deleteCustomer({ id, establishmentId });

    revalidatePath("/crm");
    return { status: "success", data: undefined, error: null };
  } catch (error) {
    console.error("Error deleting customer:", error);
    return {
      status: "error",
      data: null,
      error: error instanceof Error ? error.message : "An error occurred while deleting the customer.",
    };
  }
}
