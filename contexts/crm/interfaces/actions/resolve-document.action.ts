"use server";

import { createCrmCommandService } from "../../application/internal/commandservices/crm-command.service";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { ResolvedCustomerData } from "../../domain/model/entities/customer";
import { ActionState } from "./register-customer.action";

export async function resolveDocumentAction(
  type: "dni" | "ruc",
  number: string,
  establishmentId: string
): Promise<ActionState<ResolvedCustomerData>> {
  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
  if (!getWorkspaceEstablishment(workspace, establishmentId)?.canRead) {
    return { status: "error", data: null, error: "You are not authorized to verify documents." };
  }

  try {
    const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
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
