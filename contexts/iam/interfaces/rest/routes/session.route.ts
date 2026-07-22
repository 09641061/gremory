import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { iamCookies } from "../../cookies";

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.coerce.number().int().positive().optional(),
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function createSessionRoute(request: Request) {
  const input = sessionSchema.safeParse(await request.json());

  if (!input.success) {
    return NextResponse.json({ message: "Invalid session" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(iamCookies.accessToken, input.data.accessToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24,
  });
  cookieStore.set(iamCookies.refreshToken, input.data.refreshToken, {
    ...cookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });

  if (input.data.expiresIn !== undefined) {
    cookieStore.set(iamCookies.expiresIn, String(input.data.expiresIn), {
      ...cookieOptions,
      maxAge: 60 * 60 * 24,
    });
  }

  return new Response(null, { status: 204 });
}

export async function clearSessionRoute() {
  const cookieStore = await cookies();
  cookieStore.delete(iamCookies.accessToken);
  cookieStore.delete(iamCookies.refreshToken);
  cookieStore.delete(iamCookies.expiresIn);
  return new Response(null, { status: 204 });
}
