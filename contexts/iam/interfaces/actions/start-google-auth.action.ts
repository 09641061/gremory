"use server";

import { redirect } from "next/navigation";

export async function startGoogleAuthAction() {
  const apiBaseUrl = process.env.API_BASE_URL ?? "http://localhost:8080";
  redirect(`${apiBaseUrl}/api/v1/auth/google/authorize`);
}
