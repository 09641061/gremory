"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSchedulingContext } from "../authorization/scheduling-authorization";
import { composeSchedulingAdapters } from "../server/scheduling-composition";

const availabilitySchema = z.object({
  userId: z.string().uuid(),
  establishmentId: z.string().uuid(),
  available: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export type UpdateEmployeeAvailabilityState = {
  status: "idle" | "success" | "error";
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

  try {
    const auth = await requireSchedulingContext("scheduling:manage", parsed.data.establishmentId);
    await composeSchedulingAdapters(auth.organizationId).rosterCommandService.updateEmployeeAvailability(
      parsed.data.userId,
      parsed.data.establishmentId,
      parsed.data.available,
      auth.token,
    );
    revalidatePath("/schedule");
    return { status: "success", error: "" } as const;
  } catch (error) {
    const message =
      safePublicError(error, "Unable to update availability.").message;
    recordSafely("scheduling.update.employee.availability.action", { cause: error });
    return { status: "error", error: message } as const;
  }
}
