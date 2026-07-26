import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamSessionQueryService } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import { hasActiveSubscription } from "@/contexts/billing/domain/services/subscription-access.policy";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { continueRequestWithSession } from "@/contexts/iam/interfaces/proxy/iam-session-request";
import { apiConfig } from "@/api.config";
import { ApiError, apiClient } from "@/contexts/shared/infrastructure/http/api-client";

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

  const session = await createIamSessionQueryService().resolveSession({
    accessToken,
    refreshToken,
  });

  if (session.status === "unauthenticated") {
    if (accessToken || refreshToken || pathname === "/" || isPrivateRoute(pathname)) {
      return redirectToLogin(request);
    }
    return NextResponse.next();
  }
  if (session.status === "unavailable") return NextResponse.next();

  accessToken = session.accessToken;
  if (session.rotatedSession) {
    response = continueRequestWithSession(request, session.rotatedSession);
  }

  const applicationAccess = await getApplicationAccess(accessToken);

  if (applicationAccess === "unauthenticated") {
    return redirectToLogin(request);
  }

  // Do not convert an API outage into a false "no subscription" decision.
  // Protected backend endpoints remain the final authorization boundary.
  if (applicationAccess === "unavailable") {
    return response ?? NextResponse.next();
  }

  const activeAccess = applicationAccess === "active";

  if (activeAccess && (pathname === "/" || pathname === "/login" || pathname === "/subscribe")) {
    return redirectWithCookies(request, "/chat", response);
  }

  if (!activeAccess && (pathname === "/" || pathname === "/login" || isPrivateRoute(pathname))) {
    return redirectWithCookies(request, "/subscribe", response);
  }

  return response ?? NextResponse.next();
}

function isPrivateRoute(pathname: string) {
  return [
    "/chat",
    "/analytics",
    "/schedule",
    "/crm",
    "/catalog",
    "/team",
    "/settings",
    "/organizations",
    "/establishments",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

type SubscriptionAccess =
  | "active"
  | "inactive"
  | "unauthenticated"
  | "unavailable";
async function getApplicationAccess(accessToken: string): Promise<SubscriptionAccess> {
  const subscription = await getSubscriptionAccess(accessToken);
  if (subscription !== "inactive") return subscription;

  try {
    const workforce = await apiClient.get<{ active?: boolean }>(
      apiConfig.routes.workforce.access,
      { token: accessToken },
    );
    return workforce.active === true ? "active" : "inactive";
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return "unauthenticated";
    return "unavailable";
  }
}

async function getSubscriptionAccess(accessToken: string): Promise<SubscriptionAccess> {
  try {
    const subscription = await apiClient.get<{ active?: boolean; status?: string }>(
      apiConfig.routes.subscriptions,
      { token: accessToken },
    );
    return hasActiveSubscription(subscription)
      ? "active"
      : "inactive";
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return "unauthenticated";
    if (error instanceof ApiError && error.status === 404) return "inactive";
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

function redirectToLogin(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(iamSessionCookies.accessToken);
  response.cookies.delete(iamSessionCookies.refreshToken);
  return response;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/subscribe",
    "/chat/:path*",
    "/analytics/:path*",
    "/schedule/:path*",
    "/crm/:path*",
    "/catalog/:path*",
    "/team/:path*",
    "/settings/:path*",
    "/organizations/:path*",
    "/establishments/:path*",
  ],
};
