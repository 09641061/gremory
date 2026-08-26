"use server";

import "server-only";
import { createIamAuthenticationCommandService } from "../../application/internal/commandservices/iam-authentication-command.service";
import { createSessionAction } from "./create-session.action";

export async function exchangeGoogleCodeAction(code: string): Promise<void> {
  const session = await createIamAuthenticationCommandService().exchangeGoogleCode({ code });
  await createSessionAction(session);
}
