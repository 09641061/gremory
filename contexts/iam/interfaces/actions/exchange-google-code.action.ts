"use server";

import "server-only";
import { composeIamAdapters } from "../server/iam-composition";
import { createSessionAction } from "./create-session.action";

export async function exchangeGoogleCodeAction(code: string): Promise<void> {
  const session = await composeIamAdapters().authenticationWriter.exchangeGoogleCode({ code });
  await createSessionAction(session);
}
