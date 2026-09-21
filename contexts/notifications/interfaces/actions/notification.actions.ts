"use server";

import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { workspaceSelectionCookies, workspaceSelectionCookieOptions } from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { safePublicError } from "@/contexts/shared/interfaces/actions/safe-error";
import { composeNotificationAdapters } from "../server/notification-composition";
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
    const page = await composeNotificationAdapters().queryService.getNotifications(
      token,
      parsedPage.data,
      parsedSize.data,
    );
    return {
      ...page,
      content: page.content.map(stripServerOnlyInvitationToken),
    };
  } catch {
    return null;
  }
}

export async function fetchUnreadNotificationsCountAction(): Promise<number> {
  const token = await getAccessToken();
  if (!token) return 0;
  try {
    return await composeNotificationAdapters().queryService.getUnreadCount(token);
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
    await composeNotificationAdapters().commandService.markAsRead({ id: parsedId.data }, token);
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
    await composeNotificationAdapters().commandService.deleteNotification({ id: parsedId.data }, token);
    try { revalidatePath("/", "layout"); } catch { /* write already confirmed */ }
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to delete notification").message };
  }
}

export async function acceptInvitationNotificationAction(notificationId: string) {
  const parsedId = notificationIdSchema.safeParse(notificationId);
  if (!parsedId.success) return { success: false, error: "Invalid invitation." };
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const page = await composeNotificationAdapters().queryService.getNotifications(token, 0, 100);
    const notification = page.content.find((item) => item.id === parsedId.data);
    const invitationToken = notification?.targetToken;
    if (!invitationToken) {
      return { success: false, error: "Invitation details are unavailable." };
    }

    const result = await composeNotificationAdapters().commandService.acceptInvitation(
      { notificationId: parsedId.data, invitationToken },
      token,
    );
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
    const result = await composeNotificationAdapters().commandService.acceptPendingInvitation(token);
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
    await composeNotificationAdapters().commandService.registerDeviceToken(
      parsedDeviceToken.data,
      parsedPlatform.data,
      token,
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: safePublicError(error, "Failed to register device token").message };
  }
}

function stripServerOnlyInvitationToken(notification: PaginatedNotifications["content"][number]) {
  const clientNotification = { ...notification };
  delete clientNotification.targetToken;
  return clientNotification;
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
