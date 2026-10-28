"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireBusinessAccessToken } from "@/contexts/business/infrastructure/session/business-session";
import {
  workspaceSelectionCookieOptions,
  workspaceSelectionCookies,
} from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { createActionErrorId, type ActionState } from "@/contexts/shared/application/model/action-state";
import { composeWorkforceAdapters } from "../server/workforce-composition";
import { invitationTokenSchema, inviteWorkforceMemberSchema, saveWorkforceRoleSchema } from "../rest/workforce.schemas";

type InviteResult = ActionState<{ invitationId: string }, { email?: string[]; establishmentId?: string[]; roleId?: string[] } | null>;
const uuid = z.string().uuid();

export async function inviteWorkforceMemberAction(
  organizationId: string,
  _previous: InviteResult,
  formData: FormData,
): Promise<InviteResult> {
  const tenant = uuid.safeParse(organizationId);
  const parsed = inviteWorkforceMemberSchema.safeParse({
    email: formData.get("email"),
    establishmentId: formData.get("establishmentId"),
    roleId: formData.get("roleId"),
  });
  if (!tenant.success || !parsed.success) {
    return {
      status: "error",
      data: null,
      error: "Revisa los datos de la invitación.",
      errorId: createActionErrorId(),
      fieldErrors: parsed.success ? null : parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const accessToken = await requireBusinessAccessToken();
    const invitation = await composeWorkforceAdapters().workforceService.invite(accessToken, tenant.data, parsed.data);
    revalidatePath("/organization/invites");
    return { status: "success", data: { invitationId: invitation.id }, error: null, fieldErrors: null };
  } catch (error) {
    return actionFailure(error, "No pudimos enviar la invitación.");
  }
}

type RoleResult = ActionState<{ roleId: string }, { name?: string[]; description?: string[] } | null>;

export async function saveWorkforceRoleAction(
  organizationId: string,
  roleId: string | null,
  _previous: RoleResult,
  formData: FormData,
): Promise<RoleResult> {
  const tenant = uuid.safeParse(organizationId);
  const parsedGrants = safeJson(formData.get("selectedGrants"));
  const versionValue = formData.get("version");
  const parsed = saveWorkforceRoleSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    selectedGrants: parsedGrants,
    version: versionValue ? Number(versionValue) : undefined,
  });
  const parsedRoleId = roleId ? uuid.safeParse(roleId) : null;
  if (!tenant.success || (parsedRoleId && !parsedRoleId.success) || !parsed.success) {
    return {
      status: "error", data: null, error: "Revisa los datos del rol.", errorId: createActionErrorId(),
      fieldErrors: parsed.success ? null : parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const accessToken = await requireBusinessAccessToken();
    const service = composeWorkforceAdapters().workforceService;
    const role = parsedRoleId
      ? await service.updateRole(accessToken, tenant.data, parsedRoleId.data, parsed.data)
      : await service.createRole(accessToken, tenant.data, parsed.data);
    revalidatePath("/organization/roles");
    revalidatePath(`/organization/roles/${role.id}`);
    return { status: "success", data: { roleId: role.id }, error: null, fieldErrors: null };
  } catch (error) {
    return actionFailureForRole(error);
  }
}

export async function archiveWorkforceRoleAction(organizationId: string, roleId: string, version: number) {
  const input = z.object({ organizationId: uuid, roleId: uuid, version: z.number().int().nonnegative() })
    .safeParse({ organizationId, roleId, version });
  if (!input.success) return { success: false, error: "Rol inválido." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.archiveRole(accessToken, input.data.organizationId, input.data.roleId, input.data.version);
    revalidatePath("/organization/roles");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: publicRoleMessage(error, "No pudimos archivar el rol.") };
  }
}

export async function assignWorkforceMemberRoleAction(organizationId: string, membershipId: string, roleId: string) {
  const input = z.object({ organizationId: uuid, membershipId: uuid, roleId: uuid })
    .safeParse({ organizationId, membershipId, roleId });
  if (!input.success) return { success: false, error: "Asignación inválida." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.assignMemberRole(accessToken, input.data.organizationId, input.data.membershipId, input.data.roleId);
    revalidatePath("/organization/members");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: publicRoleMessage(error, "No pudimos cambiar el rol.") };
  }
}

export async function assignWorkforceInvitationRoleAction(organizationId: string, invitationId: string, roleId: string) {
  const input = z.object({ organizationId: uuid, invitationId: uuid, roleId: uuid })
    .safeParse({ organizationId, invitationId, roleId });
  if (!input.success) return { success: false, error: "Asignación inválida." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.assignInvitationRole(accessToken, input.data.organizationId, input.data.invitationId, input.data.roleId);
    revalidatePath("/organization/invites");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: publicRoleMessage(error, "No pudimos cambiar el rol de la invitación.") };
  }
}

export async function resendWorkforceInvitationAction(organizationId: string, invitationId: string) {
  const input = z.object({ organizationId: uuid, invitationId: uuid }).safeParse({ organizationId, invitationId });
  if (!input.success) return { success: false, error: "Invitación inválida." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.resend(accessToken, input.data.organizationId, input.data.invitationId);
    revalidatePath("/organization/invites");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: publicMessage(error, "No pudimos reenviar la invitación.") };
  }
}

export async function revokeWorkforceInvitationAction(organizationId: string, invitationId: string) {
  const input = z.object({ organizationId: uuid, invitationId: uuid }).safeParse({ organizationId, invitationId });
  if (!input.success) return { success: false, error: "Invitación inválida." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.revoke(accessToken, input.data.organizationId, input.data.invitationId);
    revalidatePath("/organization/invites");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: publicMessage(error, "No pudimos revocar la invitación.") };
  }
}

export async function deactivateWorkforceMemberAction(organizationId: string, membershipId: string) {
  const input = z.object({ organizationId: uuid, membershipId: uuid }).safeParse({ organizationId, membershipId });
  if (!input.success) return { success: false, error: "Colaborador inválido." };
  try {
    const accessToken = await requireBusinessAccessToken();
    await composeWorkforceAdapters().workforceService.deactivateMember(
      accessToken,
      input.data.organizationId,
      input.data.membershipId,
    );
    try {
      revalidatePath("/organization/members");
    } catch {
      // The backend write is already confirmed; cache invalidation is best effort.
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: memberDeactivationMessage(error) };
  }
}

export async function acceptWorkforceInvitationAction(token: string) {
  const parsed = invitationTokenSchema.safeParse(token);
  if (!parsed.success) return { success: false, error: "El enlace de invitación no es válido." };

  try {
    const accessToken = await requireBusinessAccessToken();
    const accepted = await composeWorkforceAdapters().workforceService.accept(accessToken, parsed.data);
    const cookieStore = await cookies();
    cookieStore.set(workspaceSelectionCookies.organizationId, accepted.organizationId, workspaceSelectionCookieOptions);
    cookieStore.set(workspaceSelectionCookies.establishmentId, accepted.establishmentId, workspaceSelectionCookieOptions);
  } catch (error) {
    return { success: false, error: publicMessage(error, "No pudimos aceptar la invitación.") };
  }

  redirect("/");
}

function actionFailure(error: unknown, fallback: string): InviteResult {
  return {
    status: "error",
    data: null,
    error: publicMessage(error, fallback),
    errorId: createActionErrorId(),
    fieldErrors: null,
  };
}

function actionFailureForRole(error: unknown): RoleResult {
  return { status: "error", data: null, error: publicRoleMessage(error, "No pudimos guardar el rol."), errorId: createActionErrorId(), fieldErrors: null };
}

function publicRoleMessage(error: unknown, fallback: string) {
  const status = error instanceof Error && "status" in error ? Number((error as { status?: unknown }).status) : 0;
  if (status === 403) return "Solo el Dueño puede gestionar roles.";
  if (status === 404) return "El rol ya no existe o fue archivado.";
  if (status === 409) return "El rol cambió o está en uso. Actualiza la página e inténtalo nuevamente.";
  return fallback;
}

function safeJson(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  try { return JSON.parse(value) as unknown; } catch { return []; }
}

function publicMessage(error: unknown, fallback: string) {
  const status = error instanceof Error && "status" in error ? Number((error as { status?: unknown }).status) : 0;
  if (status === 401) return "Inicia sesión para continuar.";
  if (status === 403) return "No tienes acceso para realizar esta acción.";
  if (status === 404) return "La invitación ya no existe o expiró.";
  if (status === 409) return "Esta persona ya es colaboradora o tiene una invitación pendiente.";
  return fallback;
}

function memberDeactivationMessage(error: unknown) {
  const status = error instanceof Error && "status" in error ? Number((error as { status?: unknown }).status) : 0;
  if (status === 401) return "Inicia sesión para continuar.";
  if (status === 403) return "No tienes acceso para dar de baja colaboradores.";
  if (status === 404) return "El colaborador ya no está activo.";
  if (status === 409) return "Reasigna sus citas futuras antes de darlo de baja.";
  return "No pudimos dar de baja al colaborador.";
}
