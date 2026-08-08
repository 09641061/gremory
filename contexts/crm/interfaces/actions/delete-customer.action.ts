"use server";

import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createCrmAccessPolicyService } from "../../application/internal/queryservices/crm-access-policy.service";
import { ActionState } from "./register-customer.action";

export async function deleteCustomerAction(
  id: string,
  establishmentId: string
): Promise<ActionState<void>> {
  const permissions = await createCrmAccessPolicyService().getPermissions(establishmentId);
  if (!permissions.canDeleteCustomer) {
    return { status: "error", data: null, error: "You are not authorized to delete customers." };
  }

  try {
    const service = createCrmCommandService();
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
