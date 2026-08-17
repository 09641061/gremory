"use server";

import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { UpdateCustomerCommand } from "../../domain/model/commands/update-customer.command";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { ActionState } from "./register-customer.action";
import { CustomerResponse } from "../../domain/model/entities/customer";
import { updateCustomerSchema } from "../schemas/update-customer.schema";

export async function updateCustomerAction(
  command: Omit<UpdateCustomerCommand, "establishmentId">,
  establishmentId: string
): Promise<ActionState<CustomerResponse>> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:manage")) {
    return { status: "error", data: null, error: "You are not authorized to update customers." };
  }

  const parsed = updateCustomerSchema.safeParse(command);
  if (!parsed.success) {
    return { status: "error", data: null, error: parsed.error.issues[0]?.message ?? "Invalid customer data." };
  }

  try {
    const service = createCrmCommandService();
    const result = await service.updateCustomer({
      ...parsed.data,
      establishmentId,
    });

    revalidatePath("/crm");
    return { status: "success", data: result, error: null };
  } catch (error: unknown) {
    console.error("Error updating customer:", error);
    let message = "An error occurred while updating the customer.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = "A customer with this document number is already registered in this establishment.";
      } else if (error.status === 422) {
        message = "The identity document could not be validated.";
      } else if (error.message) {
        message = error.message;
      }
    }
    return { status: "error", data: null, error: message };
  }
}
