"use server";

import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { ResolvedCustomerData } from "../../domain/model/entities/customer";
import { ActionState } from "./register-customer.action";

export async function resolveDocumentAction(
  type: "dni" | "ruc",
  number: string
): Promise<ActionState<ResolvedCustomerData>> {
  try {
    const service = createCrmCommandService();
    const result = await service.resolveDocument(
      type === "dni" ? number : undefined,
      type === "ruc" ? number : undefined
    );
    return { status: "success", data: result, error: null };
  } catch (error: unknown) {
    console.error("Error resolving identity document:", error);
    return {
      status: "error",
      data: null,
      error: "Identity document not found or invalid.",
    };
  }
}
