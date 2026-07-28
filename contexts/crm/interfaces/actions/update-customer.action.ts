"use server";

import { revalidatePath } from "next/cache";
import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { UpdateCustomerCommand } from "../../domain/model/commands/update-customer.command";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import { ActionState } from "./register-customer.action";
import { CustomerResponse } from "../../domain/model/entities/customer";

export async function updateCustomerAction(
  command: Omit<UpdateCustomerCommand, "establishmentId">,
  establishmentId: string
): Promise<ActionState<CustomerResponse>> {
  try {
    const service = createCrmCommandService();
    const result = await service.updateCustomer({
      ...command,
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
