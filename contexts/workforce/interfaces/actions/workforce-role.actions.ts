"use server";

import { revalidatePath } from "next/cache";
import { createWorkforceRoleCommandService } from "../../application/internal/commandservices/workforce-role-command.service";
import {
  assignWorkforceRoleCommand,
  createWorkforceRoleCommand,
  updateWorkforceRoleCommand,
} from "../../domain/model/commands/workforce-role.commands";
import { requireTeamAccessToken } from "../../infrastructure/session/team-session";
import {
  assignWorkforceRoleRequestSchema,
  workforceRoleRequestSchema,
} from "../rest/schemas/workforce-role.schemas";
import {
  workforceRoleActionError,
  type WorkforceRoleActionResult,
} from "./workforce-role-action-result";

export async function createWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const parsed = workforceRoleRequestSchema.safeParse(parseRolePayload(formData));
  if (!parsed.success) return workforceRoleActionError(parsed.error.issues[0]?.message);

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    const role = await service.create(
      createWorkforceRoleCommand(parsed.data),
    );
    revalidateWorkforceRoleView();
    return {
      status: "success",
      data: { roleId: role.id ?? undefined },
      error: null,
    };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

export async function updateWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const parsed = workforceRoleRequestSchema.safeParse(parseRolePayload(formData));
  const roleId = formData.get("roleId");
  const roleIdParsed = assignWorkforceRoleRequestSchema.safeParse({ roleId });
  if (!roleIdParsed.success) return workforceRoleActionError(roleIdParsed.error.issues[0]?.message);
  if (!parsed.success) return workforceRoleActionError(parsed.error.issues[0]?.message);

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    const role = await service.update(
      updateWorkforceRoleCommand({
        roleId: roleIdParsed.data.roleId,
        ...parsed.data,
      }),
    );
    revalidateWorkforceRoleView();
    return {
      status: "success",
      data: { roleId: role.id ?? undefined },
      error: null,
    };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

export async function assignWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const parsed = assignWorkforceRoleRequestSchema.safeParse({
    roleId: formData.get("roleId"),
  });
  const memberId = formData.get("memberId");
  const memberIdValue = typeof memberId === "string" ? memberId : "";
  if (!parsed.success) return workforceRoleActionError(parsed.error.issues[0]?.message);
  if (!memberIdValue.trim()) return workforceRoleActionError("Member ID is required");

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    await service.assign(
      assignWorkforceRoleCommand({
        memberId: memberIdValue,
        roleId: parsed.data.roleId,
      }),
    );
    revalidateWorkforceRoleView();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

function parseRolePayload(formData: FormData) {
  const permissions = formData
    .getAll("permissions")
    .filter((value): value is string => typeof value === "string");
  return {
    name: formData.get("name"),
    permissions,
  };
}

function revalidateWorkforceRoleView() {
  revalidatePath("/team");
}
