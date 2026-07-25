import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamAuthenticationCommandService } from "@/contexts/iam/application/internal/commandservices/iam-authentication-command.service";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { coordinateRefresh } from "@/contexts/iam/infrastructure/session/iam-refresh-coordinator";
import type { AuthenticationSession } from "@/contexts/iam/domain/model/entities/authentication-session";
import {
  iamSessionCookieOptions,
  iamSessionCookies,
} from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get(iamSessionCookies.accessToken)?.value;
  const refreshToken = request.cookies.get(iamSessionCookies.refreshToken)?.value;
  const { pathname } = request.nextUrl;
  let response: NextResponse | null = null;

  // Login must remain reachable even when the browser still sends cookies for
  // a session revoked by a login in another browser.
  if (pathname === "/login") {
    return NextResponse.next();
  }

  if (!accessToken) {
    if (pathname === "/" || isPrivateRoute(pathname)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  let authenticationAccess = await verifyAccessToken(accessToken);

  if (authenticationAccess === "unauthenticated") {
    const session = refreshToken ? await refreshAccessToken(refreshToken) : null;
    if (!session) return redirectToLogin(request);

    accessToken = session.accessToken;
    response = NextResponse.next();
    response.cookies.set(iamSessionCookies.accessToken, session.accessToken, {
      ...iamSessionCookieOptions,
      maxAge: 60 * 60 * 24,
    });
    response.cookies.set(iamSessionCookies.refreshToken, session.refreshToken, {
      ...iamSessionCookieOptions,
      maxAge: 60 * 60 * 24 * 30,
    });

    // Retry exactly once with the rotated access token.
    authenticationAccess = await verifyAccessToken(accessToken);
    if (authenticationAccess === "unauthenticated") return redirectToLogin(request);
  }

  if (authenticationAccess === "unavailable") {
    return response ?? NextResponse.next();
  }

  const subscriptionAccess = await getSubscriptionAccess(accessToken);

  if (subscriptionAccess === "unauthenticated") {
    return redirectToLogin(request);
  }

  // Do not convert an API outage into a false "no subscription" decision.
  // Protected backend endpoints remain the final authorization boundary.
  if (subscriptionAccess === "unavailable") {
    return response ?? NextResponse.next();
  }

  const activeSubscription = subscriptionAccess === "active";

  if (activeSubscription && (pathname === "/" || pathname === "/login" || pathname === "/subscribe")) {
    return redirectWithCookies(request, "/chat", response);
  }

  if (!activeSubscription && (pathname === "/" || pathname === "/login" || isPrivateRoute(pathname))) {
    return redirectWithCookies(request, "/subscribe", response);
  }

  return response ?? NextResponse.next();
}

function isPrivateRoute(pathname: string) {
  return ["/chat", "/analytics", "/schedule", "/crm", "/catalog", "/team", "/settings"].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

type SubscriptionAccess = "active" | "inactive" | "unauthenticated" | "unavailable";
type AuthenticationAccess = "authenticated" | "unauthenticated" | "unavailable";

async function verifyAccessToken(accessToken: string): Promise<AuthenticationAccess> {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/v1/auth/verify`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (response.status === 401 || response.status === 400) return "unauthenticated";
    if (!response.ok) return "unavailable";
    return "authenticated";
  } catch {
    return "unavailable";
  }
}

async function getSubscriptionAccess(accessToken: string): Promise<SubscriptionAccess> {
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? "http://localhost:8080"}/api/billing/subscriptions`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      },
    );

    if (response.status === 401) return "unauthenticated";
    if (response.status === 404) return "inactive";
    if (!response.ok) return "unavailable";
    return hasActiveSubscription((await response.json()) as { active?: boolean; status?: string })
      ? "active"
      : "inactive";
  } catch {
    return "unavailable";
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
  return coordinateRefresh(refreshToken, async (token): Promise<AuthenticationSession | null> => {
    try {
      return await createIamAuthenticationCommandService().refreshSession({
        refreshToken: token,
      });
    } catch {
      return null;
    }
  });
}

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(iamSessionCookies.accessToken);
  response.cookies.delete(iamSessionCookies.refreshToken);
  return response;
}

export const config = {
  matcher: ["/", "/login", "/subscribe", "/chat/:path*", "/analytics/:path*", "/schedule/:path*", "/crm/:path*", "/catalog/:path*", "/team/:path*", "/settings/:path*"],
};
