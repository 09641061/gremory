"use server";

import { redirect } from "next/navigation";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";
import { cookies } from "next/headers";
import { normalizeAuthReturnPath } from "../../domain/model/valueobjects/auth-return-path";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "../../infrastructure/session/iam-session-cookie";

export async function startGoogleAuthAction(formData: FormData) {
  const returnTo = normalizeAuthReturnPath(formData.get("returnTo"));
  if (returnTo) {
    (await cookies()).set(iamSessionCookies.returnTo, returnTo, {
      ...iamSessionCookieOptions,
      maxAge: 60 * 10,
    });
  }
  redirect(apiClient.buildUrl(apiConfig.routes.authentication.googleAuthorize));
}
