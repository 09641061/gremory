import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "../../../infrastructure/session/iam-session-cookie";

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export async function createSessionRoute(request: Request) {
  const input = sessionSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json({ message: "Invalid session" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(iamSessionCookies.accessToken, input.data.accessToken, {
    ...iamSessionCookieOptions,
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set(iamSessionCookies.refreshToken, input.data.refreshToken, {
    ...iamSessionCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  return new Response(null, { status: 204 });
}

export async function clearSessionRoute() {
  const cookieStore = await cookies();
  cookieStore.delete(iamSessionCookies.accessToken);
  cookieStore.delete(iamSessionCookies.refreshToken);
  cookieStore.delete(iamSessionCookies.pendingEmail);
  return new Response(null, { status: 204 });
}
