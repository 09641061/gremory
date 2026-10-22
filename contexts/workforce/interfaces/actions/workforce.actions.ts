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
import { invitationTokenSchema, inviteWorkforceMemberSchema } from "../rest/workforce.schemas";

type InviteResult = ActionState<{ invitationId: string }, { email?: string[]; establishmentId?: string[] } | null>;
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
