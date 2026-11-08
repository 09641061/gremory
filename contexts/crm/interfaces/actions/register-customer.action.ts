"use server";



import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../server/crm-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { RegisterCustomerCommand } from "../../application/models/commands";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { createActionErrorId, type ActionState } from "./action-state";
import { CustomerResponse } from "../../application/models/customer";
import { registerCustomerSchema } from "../schemas/register-customer.schema";

export async function registerCustomerAction(
  command: Omit<RegisterCustomerCommand, "establishmentId">,
  establishmentId: string
): Promise<ActionState<CustomerResponse>> {
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:manage")) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to register customers.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  const parsed = registerCustomerSchema.safeParse(command);
  if (!parsed.success) {
    return {
      status: "error",
      data: null,
      error: parsed.error.issues[0]?.message ?? "Invalid customer data.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
    const result = await service.registerCustomer({
      ...parsed.data,
      establishmentId,
    });

    try {
      revalidatePath("/crm");
    } catch {
      // The backend write is already confirmed; cache invalidation is best effort.
    }
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch (error: unknown) {
    let message = "An error occurred while registering the customer.";
    if (error instanceof ApiError) {
      if (error.status === 409) {
        message = "A customer with this document number is already registered in this establishment.";
      } else if (error.status === 422) {
        message = "The identity document could not be validated.";
      }
    }
    return { status: "error", data: null, error: message, errorId: createActionErrorId(), fieldErrors: null };
  }
}
