"use server";

import { z } from "zod";
import { createBusinessWorkspaceQueryService } from "@/contexts/business/application/internal/queryservices/business-workspace-query.service";
import { getWorkspaceEstablishment, hasEstablishmentPermission } from "@/contexts/shared/application/services/workspace-establishment-permissions";
import { SchedulingApiGateway } from "../../infrastructure/gateways/scheduling-api.gateway";

const availabilitySchema = z.object({
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  available: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type UpdateEmployeeAvailabilityState = {
  status: "success" | "error";
  error: string;
};

export async function updateEmployeeAvailabilityAction(
  _previous: UpdateEmployeeAvailabilityState,
  formData: FormData,
) {
  const parsed = availabilitySchema.safeParse({
    userId: formData.get("userId"),
    establishmentId: formData.get("establishmentId"),
    available: formData.get("available"),
  });
  if (!parsed.success) return { status: "error", error: "Invalid availability data." } as const;

  const workspace = await createBusinessWorkspaceQueryService().getHeaderViewModel({
    establishmentId: parsed.data.establishmentId,
  });
  const establishment = getWorkspaceEstablishment(workspace, parsed.data.establishmentId);
  if (!hasEstablishmentPermission(establishment, "scheduling:manage")) {
    return { status: "error", error: "You are not authorized to update scheduling availability." } as const;
  }

  try {
    await new SchedulingApiGateway().updateEmployeeAvailability(
      parsed.data.userId,
      parsed.data.establishmentId,
      parsed.data.available,
    );
    return { status: "success", error: "" } as const;
  } catch (error) {
    return { status: "error", error: error instanceof Error ? error.message : "Unable to update availability." } as const;
  }
}
