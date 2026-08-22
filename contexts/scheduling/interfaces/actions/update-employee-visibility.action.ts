"use server";

import { z } from "zod";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";

const visibilitySchema = z.object({
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  visible: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type UpdateEmployeeVisibilityState = {
  status: "idle" | "success" | "error";
  error: string;
};

export async function updateEmployeeVisibilityAction(
  _previous: UpdateEmployeeVisibilityState,
  formData: FormData,
) {
  const parsed = visibilitySchema.safeParse({
    userId: formData.get("userId"),
    establishmentId: formData.get("establishmentId"),
    visible: formData.get("visible"),
  });
  if (!parsed.success) return { status: "error", error: "Invalid scheduling visibility data." } as const;

  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({
    establishmentId: parsed.data.establishmentId,
  });
  const establishment = getWorkspaceEstablishment(workspace, parsed.data.establishmentId);
  if (!hasEstablishmentPermission(establishment, "scheduling:manage")) {
    return { status: "error", error: "You are not authorized to update scheduling visibility." } as const;
  }
  const organizationId = establishment?.organizationId ?? workspace.organization?.id;
  if (!organizationId) {
    return { status: "error", error: "Missing organization context." } as const;
  }

  try {
    await new SchedulingApiGateway(organizationId).updateEmployeeVisibility(
      parsed.data.userId,
      parsed.data.establishmentId,
      parsed.data.visible,
    );
    return { status: "success", error: "" } as const;
  } catch (error) {
    const message = error instanceof Error && error.message.trim()
      ? error.message
      : "Unable to update scheduling visibility.";
    console.error("Failed to update scheduling visibility:", error);
    return { status: "error", error: message } as const;
  }
}
