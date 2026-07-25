"use server";

import { redirect } from "next/navigation";
import { apiConfig } from "@/api.config";
import { apiClient } from "@/contexts/shared/infrastructure/http/api-client";

export async function startGoogleAuthAction() {
  redirect(apiClient.buildUrl(apiConfig.routes.authentication.googleAuthorize));
}
