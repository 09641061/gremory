"use server";

import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies, workspaceSelectionCookieOptions } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { createNotificationCommandService, createNotificationQueryService } from "../../application/factory";
import type { PaginatedNotifications } from "../../domain/model/entities/notification";

const notificationIdSchema = z.string().trim().min(1).max(200);
const pageSchema = z.number().int().nonnegative().max(10_000).default(0);
const sizeSchema = z.number().int().positive().max(100).default(10);
const deviceTokenSchema = z.string().trim().min(1).max(2048);
const platformSchema = z.enum(["WEB", "ANDROID", "IOS"]);

async function getAccessToken(): Promise<string | null> {
  try {
    return (await cookies()).get(iamSessionCookies.accessToken)?.value ?? null;
  } catch {
    return null;
  }
}

export async function fetchNotificationsAction(page = 0, size = 10): Promise<PaginatedNotifications | null> {
  const parsedPage = pageSchema.safeParse(page);
  const parsedSize = sizeSchema.safeParse(size);
  if (!parsedPage.success || !parsedSize.success) return null;
  const token = await getAccessToken();
  if (!token) return null;
  try {
    return await createNotificationQueryService().getNotifications(token, parsedPage.data, parsedSize.data);
  } catch {
    return null;
  }
}

export async function fetchUnreadNotificationsCountAction(): Promise<number> {
  const token = await getAccessToken();
  if (!token) return 0;
  try {
    return await createNotificationQueryService().getUnreadCount(token);
  } catch {
    return 0;
  }
}

export async function markNotificationAsReadAction(id: string) {
  const parsedId = notificationIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid notification." };
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    await createNotificationCommandService().markAsRead({ id: parsedId.data }, token);
    try { revalidatePath("/", "layout"); } catch { /* write already confirmed */ }
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to mark as read").message };
  }
}

export async function deleteNotificationAction(id: string) {
  const parsedId = notificationIdSchema.safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid notification." };
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    await createNotificationCommandService().deleteNotification({ id: parsedId.data }, token);
    try { revalidatePath("/", "layout"); } catch { /* write already confirmed */ }
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to delete notification").message };
  }
}

export async function acceptInvitationNotificationAction(notificationId: string, invitationToken: string) {
  const parsedId = notificationIdSchema.safeParse(notificationId);
  const parsedToken = z.string().trim().min(1).max(2048).safeParse(invitationToken);
  if (!parsedId.success || !parsedToken.success) return { success: false, error: "Invalid invitation." };
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const result = await createNotificationCommandService().acceptInvitation({ notificationId: parsedId.data, invitationToken: parsedToken.data }, token);
    await persistAcceptedWorkspace(result);
    try { revalidatePath("/", "layout"); } catch { /* write already confirmed */ }
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to accept invitation").message };
  }
}

export async function acceptPendingInvitationAction() {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const result = await createNotificationCommandService().acceptPendingInvitation(token);
    await persistAcceptedWorkspace(result);
    try { revalidatePath("/", "layout"); } catch { /* write already confirmed */ }
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to accept invitation").message };
  }
}

export async function registerDeviceTokenAction(deviceToken: string, platform = "WEB") {
  const parsedDeviceToken = deviceTokenSchema.safeParse(deviceToken);
  const parsedPlatform = platformSchema.safeParse(platform);
  if (!parsedDeviceToken.success || !parsedPlatform.success) return { success: false, error: "Invalid device registration." };
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const { notificationApiGateway } = await import("../../infrastructure/gateways/notification-api.gateway");
    await notificationApiGateway.registerDeviceToken(token, parsedDeviceToken.data, parsedPlatform.data);
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to register device token").message };
  }
}

async function persistAcceptedWorkspace(result: { organizationId?: string; establishmentId?: string }) {
  try {
    const cookieStore = await cookies();
    if (result.organizationId) cookieStore.set(workspaceSelectionCookies.organizationId, result.organizationId, workspaceSelectionCookieOptions);
    if (result.establishmentId) cookieStore.set(workspaceSelectionCookies.establishmentId, result.establishmentId, workspaceSelectionCookieOptions);
  } catch {
    // Cookie persistence is best effort; backend acceptance is authoritative.
  }
}
