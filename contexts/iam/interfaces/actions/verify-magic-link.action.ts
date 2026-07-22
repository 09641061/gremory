"use server";

import { redirect } from "next/navigation";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { z } from "zod";

const tokenSchema = z.string().min(1);

export async function verifyMagicLinkAction(token: string) {
  const validToken = tokenSchema.parse(token);
  const session = await createIamAuthenticationCommandService().verifyMagicLink({
    token: validToken,
  });

  redirect(
    `/auth/callback#access_token=${encodeURIComponent(session.accessToken)}&refresh_token=${encodeURIComponent(session.refreshToken)}&expires_in=${session.expiresIn}`
  );
}
