"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { createCrmCommandService } from "../server/crm-composition";
import { composeBusinessAdapters } from "@/contexts/business/interfaces/server/business-composition";
import { getWorkspaceEstablishment } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { ResolvedCustomerData } from "../../application/models/customer";
import { createActionErrorId, type ActionState } from "./action-state";
import { resolveDocumentInputSchema } from "../schemas/action-input.schema";

export async function resolveDocumentAction(
  type: "dni" | "ruc",
  number: string,
  establishmentId: string
): Promise<ActionState<ResolvedCustomerData>> {
  const parsed = resolveDocumentInputSchema.safeParse({ type, number, establishmentId });
  if (!parsed.success) {
    return { status: "error", data: null, error: "Invalid identity document.", errorId: createActionErrorId(), fieldErrors: null };
  }
  const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
  if (!getWorkspaceEstablishment(workspace, establishmentId)?.canRead) {
    return {
      status: "error",
      data: null,
      error: "You are not authorized to verify documents.",
      errorId: createActionErrorId(),
      fieldErrors: null,
    };
  }

  try {
    const workspace = await composeBusinessAdapters().workspaceQueryService.getHeaderViewModel({ establishmentId });
    const service = createCrmCommandService(workspace.organization?.id);
    const result = await service.resolveDocument(
      parsed.data.establishmentId,
      parsed.data.type === "dni" ? parsed.data.number : undefined,
      parsed.data.type === "ruc" ? parsed.data.number : undefined
    );
    return { status: "success", data: result, error: null, errorId: null, fieldErrors: null };
  } catch {
    const errorId = createActionErrorId();
    recordSafely("crm.resolve.document.action", { correlationId: errorId, code: "IDENTITY_RESOLUTION_FAILED" });
    return {
      status: "error",
      data: null,
      error: "Identity document not found or invalid.",
      errorId,
      fieldErrors: null,
    };
  }
}
