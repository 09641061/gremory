"use server";

import { revalidatePath } from "next/cache";
import { createWorkforceRoleCommandService } from "../../application/internal/commandservices/workforce-role-command.service";
import {
  assignWorkforceRoleCommand,
  createWorkforceRoleCommand,
  deleteWorkforceRoleCommand,
  patchWorkforceRoleCommand,
  removeWorkforceRoleAssignmentCommand,
} from "../../domain/model/commands/workforce-role.commands";
import { requireTeamAccessToken } from "../../infrastructure/session/team-session";
import {
  assignWorkforceRoleRequestSchema,
  workforceRoleCreateRequestSchema,
  workforceRolePatchRequestSchema,
} from "../rest/schemas/workforce-role.schemas";
import {
  workforceRoleActionError,
  type WorkforceRoleActionResult,
} from "./workforce-role-action-result";

export async function createWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const parsed = workforceRoleCreateRequestSchema.safeParse(parseCreateRolePayload(formData));
  if (!parsed.success) return workforceRoleActionError(parsed.error.issues[0]?.message);

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    const role = await service.create(
      createWorkforceRoleCommand(parsed.data),
    );
    revalidateWorkforceRoleView();
    return {
      status: "success",
      data: {
        roleId: role.id ?? undefined,
        name: role.getName(),
        position: role.position,
      },
      error: null,
    };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

export async function patchWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const parsed = workforceRolePatchRequestSchema.safeParse(parsePatchRolePayload(formData));
  const roleId = formData.get("roleId");
  const roleIdParsed = assignWorkforceRoleRequestSchema.safeParse({ roleId });
  if (!roleIdParsed.success) return workforceRoleActionError(roleIdParsed.error.issues[0]?.message);
  if (!parsed.success) return workforceRoleActionError(parsed.error.issues[0]?.message);

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    const role = await service.patch(
      patchWorkforceRoleCommand({
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

export async function removeWorkforceRoleAssignmentAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const role = assignWorkforceRoleRequestSchema.safeParse({ roleId: formData.get("roleId") });
  const member = assignWorkforceRoleRequestSchema.shape.roleId.safeParse(formData.get("memberId"));
  if (!role.success || !member.success) return workforceRoleActionError("Invalid role assignment");
  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    if (!service.removeAssignment) throw new Error("Role assignment removal is unavailable");
    await service.removeAssignment(
      removeWorkforceRoleAssignmentCommand({ memberId: member.data, roleId: role.data.roleId }),
    );
    revalidateWorkforceRoleView();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

export async function deleteWorkforceRoleAction(
  _previous: WorkforceRoleActionResult,
  formData: FormData,
): Promise<WorkforceRoleActionResult> {
  const roleIdParsed = assignWorkforceRoleRequestSchema.safeParse({
    roleId: formData.get("roleId"),
  });
  if (!roleIdParsed.success) return workforceRoleActionError(roleIdParsed.error.issues[0]?.message);

  try {
    const service = createWorkforceRoleCommandService(await requireTeamAccessToken());
    await service.delete(
      deleteWorkforceRoleCommand({
        roleId: roleIdParsed.data.roleId,
      }),
    );
    revalidateWorkforceRoleView();
    return { status: "success", data: null, error: null };
  } catch (error) {
    return workforceRoleActionError(error);
  }
}

function parseCreateRolePayload(formData: FormData) {
  return {
    name: formData.get("name"),
  };
}

function parsePatchRolePayload(formData: FormData) {
  const permissions = formData.has("permissionsSubmitted")
    ? formData
        .getAll("permissions")
        .filter((value): value is string => typeof value === "string")
    : undefined;
  return {
    name: typeof formData.get("name") === "string" ? formData.get("name") : undefined,
    permissions,
    position: formData.has("position") ? Number(formData.get("position")) : undefined,
  };
}

function revalidateWorkforceRoleView() {
  revalidatePath("/team");
  revalidatePath("/permissions");
}
