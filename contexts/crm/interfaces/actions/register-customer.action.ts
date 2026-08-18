"use server";

import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { RegisterCustomerCommand } from "../../domain/model/commands/register-customer.command";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { CustomerResponse } from "../../domain/model/entities/customer";
import { registerCustomerSchema } from "../schemas/register-customer.schema";

export type ActionState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export async function registerCustomerAction(
  command: Omit<RegisterCustomerCommand, "establishmentId">,
  establishmentId: string
): Promise<ActionState<CustomerResponse>> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!hasEstablishmentPermission(getWorkspaceEstablishment(workspace, establishmentId), "crm:manage")) {
    return { status: "error", data: null, error: "You are not authorized to register customers." };
  }

  const parsed = registerCustomerSchema.safeParse(command);
  if (!parsed.success) {
    return { status: "error", data: null, error: parsed.error.issues[0]?.message ?? "Invalid customer data." };
  }

  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
    const result = await service.registerCustomer({
      ...parsed.data,
      establishmentId,
    });

    revalidatePath("/crm");
    return { status: "success", data: result, error: null };
  } catch (error: unknown) {
    console.error("Error registering customer:", error);
    let message = "An error occurred while registering the customer.";
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
