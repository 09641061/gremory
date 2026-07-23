import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamAuthenticationCommandService } from "@/contexts/iam/application/internal/commandservices/iam-authentication-command.service";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { shouldRefreshAccessToken } from "@/contexts/iam/domain/services/iam-access-token-refresh.policy";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get(iamSessionCookies.accessToken)?.value;
  const refreshToken = request.cookies.get(iamSessionCookies.refreshToken)?.value;
  const { pathname } = request.nextUrl;
  let response: NextResponse | null = null;

  if (!accessToken) {
    if (pathname === "/" || isPrivateRoute(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (accessToken && shouldRefreshAccessToken(accessToken)) {
    const session = refreshToken ? await refreshAccessToken(refreshToken) : null;
    if (!session) {
      return redirectToLogin(request);
    }

    accessToken = session.accessToken;
    response = NextResponse.next();
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
  }

  const activeSubscription = await hasSubscriptionAccess(accessToken);

  if (activeSubscription && (pathname === "/" || pathname === "/login" || pathname === "/subscribe")) {
    return redirectWithCookies(request, "/dashboard", response);
  }

  if (!activeSubscription && (pathname === "/" || pathname === "/login" || isPrivateRoute(pathname))) {
    return redirectWithCookies(request, "/subscribe", response);
  }

  return response ?? NextResponse.next();
}

function isPrivateRoute(pathname: string) {
  return ["/dashboard", "/analytics", "/schedule", "/crm", "/catalog", "/team"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

async function hasSubscriptionAccess(accessToken: string) {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/billing/subscriptions`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (!response.ok) return false;
    return hasActiveSubscription((await response.json()) as { active?: boolean; status?: string });
  } catch {
    return false;
  }
}

function redirectWithCookies(request: NextRequest, path: string, response: NextResponse | null) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));
  if (response) {
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
  }
  return redirectResponse;
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
  matcher: ["/", "/login", "/subscribe", "/dashboard/:path*", "/analytics/:path*", "/schedule/:path*", "/crm/:path*", "/catalog/:path*", "/team/:path*"],
};
