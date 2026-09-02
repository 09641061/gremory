"use server";

import "server-only";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import {
  workspaceSelectionCookies,
  workspaceSelectionCookieOptions,
} from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";
import {
  createNotificationCommandService,
  createNotificationQueryService,
} from "../../application/factory";
import type { PaginatedNotifications } from "../../domain/model/entities/notification";

async function getAccessToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(iamSessionCookies.accessToken)?.value ?? null;
  } catch {
    return null;
  }
}

function isExpectedAuthorizationError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export async function fetchNotificationsAction(page = 0, size = 10): Promise<PaginatedNotifications | null> {
  const token = await getAccessToken();
  if (!token) return null;
  try {
    const queryService = createNotificationQueryService();
    return await queryService.getNotifications(token, page, size);
  } catch (error) {
    if (!isExpectedAuthorizationError(error)) {
      console.error("fetchNotificationsAction error:", error);
    }
    return null;
  }
}

export async function fetchUnreadNotificationsCountAction(): Promise<number> {
  const token = await getAccessToken();
  if (!token) return 0;
  try {
    const queryService = createNotificationQueryService();
    return await queryService.getUnreadCount(token);
  } catch (error) {
    if (!isExpectedAuthorizationError(error)) {
      console.error("fetchUnreadNotificationsCountAction error:", error);
    }
    return 0;
  }
}

export async function markNotificationAsReadAction(id: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const commandService = createNotificationCommandService();
    await commandService.markAsRead({ id }, token);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to mark as read" };
  }
}

export async function deleteNotificationAction(id: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const commandService = createNotificationCommandService();
    await commandService.deleteNotification({ id }, token);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete notification" };
  }
}

export async function acceptInvitationNotificationAction(notificationId: string, invitationToken: string) {
  const token = await getAccessToken();
  if (!token) return { success: false, error: "Authentication required" };
  try {
    const commandService = createNotificationCommandService();
    const result = await commandService.acceptInvitation({ notificationId, invitationToken }, token);

    try {
      const cookieStore = await cookies();
      if (result?.organizationId) {
        cookieStore.set(workspaceSelectionCookies.organizationId, result.organizationId, workspaceSelectionCookieOptions);
      }
      if (result?.establishmentId) {
        cookieStore.set(workspaceSelectionCookies.establishmentId, result.establishmentId, workspaceSelectionCookieOptions);
      }
    } catch {
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("acceptInvitationNotificationAction error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to accept invitation" };
  }
}
