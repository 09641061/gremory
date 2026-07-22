import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamAuthenticationCommandService } from "@/contexts/iam/application/internal/commandservices/iam-authentication-command.service";
import { shouldRefreshAccessToken } from "@/contexts/iam/domain/services/iam-access-token-refresh.policy";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(iamSessionCookies.accessToken)?.value;
  const refreshToken = request.cookies.get(iamSessionCookies.refreshToken)?.value;
  const hasSession = Boolean(accessToken);
  const { pathname } = request.nextUrl;

  if (pathname === "/" && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" && accessToken && shouldRefreshAccessToken(accessToken)) {
    const session = refreshToken ? await refreshAccessToken(refreshToken) : null;
    if (!session) {
      return redirectToLogin(request);
    }

    const response = NextResponse.next();
    response.cookies.set(iamSessionCookies.accessToken, session.accessToken, {
      ...iamSessionCookieOptions,
      maxAge: session.expiresIn,
    });
    response.cookies.set(iamSessionCookies.refreshToken, session.refreshToken, {
      ...iamSessionCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });
    response.cookies.set(iamSessionCookies.expiresIn, String(session.expiresIn), {
      ...iamSessionCookieOptions,
      maxAge: session.expiresIn,
    });
    return response;
  }

  return NextResponse.next();
}

async function refreshAccessToken(refreshToken: string) {
  try {
    return await createIamAuthenticationCommandService().refreshSession({
      refreshToken,
    });
  } catch {
    return null;
  }
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(iamSessionCookies.accessToken);
  response.cookies.delete(iamSessionCookies.refreshToken);
  response.cookies.delete(iamSessionCookies.expiresIn);
  return response;
}

export const config = {
  matcher: ["/", "/login"],
};
