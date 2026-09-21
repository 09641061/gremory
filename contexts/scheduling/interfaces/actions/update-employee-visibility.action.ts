"use server";

import { recordSafely } from "@/contexts/shared/interfaces/observability/sanitize-error";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";


import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSchedulingContext } from "../authorization/scheduling-authorization";
import { composeSchedulingAdapters } from "../server/scheduling-composition";

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

  try {
    const auth = await requireSchedulingContext("scheduling:manage", parsed.data.establishmentId);
    await composeSchedulingAdapters(auth.organizationId).rosterCommandService.updateEmployeeVisibility(
      parsed.data.userId,
      parsed.data.establishmentId,
      parsed.data.visible,
      auth.token,
    );
    revalidatePath("/schedule");
    return { status: "success", error: "" } as const;
  } catch (error) {
    const message = safePublicError(error, "Unable to update scheduling visibility.").message;
    recordSafely("scheduling.update.employee.visibility.action", { cause: error });
    return { status: "error", error: message } as const;
  }
}
