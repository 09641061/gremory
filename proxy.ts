import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamSessionQueryService } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import {
  getApplicationHomePath,
  hasActiveSubscription,
} from "@/contexts/billing/domain/services/subscription-access.policy";
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

  const setupAccess = await getSetupAccess(accessToken, applicationAccess);
  if (setupAccess.status === "unauthenticated") {
    return redirectToLogin(request);
  }
  if (setupAccess.status === "unavailable") {
    return response ?? NextResponse.next();
  }

  const activeAccess = applicationAccess.status === "active";
  const homePath = setupAccess.hasOrganization || setupAccess.hasWorkforceAccess
    ? applicationAccess.homePath
    : "/organizations";

  if (activeAccess && (pathname === "/" || pathname === "/login" || pathname === "/subscribe")) {
    return redirectWithCookies(request, homePath, response);
  }

  if (activeAccess && homePath === "/schedule" && (pathname === "/chat" || pathname.startsWith("/chat/"))) {
    return redirectWithCookies(request, homePath, response);
  }

  if (activeAccess && pathname === "/organizations" && setupAccess.hasWorkforceAccess && !setupAccess.hasOrganization) {
    return redirectWithCookies(request, homePath, response);
  }

  if (activeAccess && homePath === "/organizations" && isPrivateRoute(pathname) && pathname !== "/organizations") {
    return redirectWithCookies(request, homePath, response);
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

type ApplicationAccess =
  | { status: "active"; homePath: "/chat" | "/schedule"; source: "subscription" | "workforce" }
  | { status: "inactive" | "unauthenticated" | "unavailable" };

async function getApplicationAccess(accessToken: string): Promise<ApplicationAccess> {
  const subscription = await getSubscriptionAccess(accessToken);
  if (subscription.status !== "inactive") return subscription;

  try {
    const workforce = await apiClient.get<{ active?: boolean }>(
      apiConfig.routes.workforce.access,
      { token: accessToken },
    );
    return workforce.active === true
      ? { status: "active", homePath: "/schedule", source: "workforce" }
      : { status: "inactive" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    return { status: "unavailable" };
  }
}

type SetupAccess =
  | {
      hasOrganization: boolean;
      hasWorkforceAccess: boolean;
      status: "ready";
    }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

async function getSetupAccess(accessToken: string, applicationAccess: Extract<ApplicationAccess, { status: "active" }>): Promise<SetupAccess> {
  try {
    await apiClient.get(apiConfig.routes.organizations, { token: accessToken });
    return {
      status: "ready",
      hasOrganization: true,
      hasWorkforceAccess: applicationAccess.source === "workforce",
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status !== 404) return { status: "unavailable" };
  }

  if (applicationAccess.source === "workforce") {
    return {
      status: "ready",
      hasOrganization: false,
      hasWorkforceAccess: true,
    };
  }

  try {
    const workforce = await apiClient.get<{ active?: boolean }>(
      apiConfig.routes.workforce.access,
      { token: accessToken },
    );
    return {
      status: "ready",
      hasOrganization: false,
      hasWorkforceAccess: workforce.active === true,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "ready",
        hasOrganization: false,
        hasWorkforceAccess: false,
      };
    }
    return { status: "unavailable" };
  }
}

async function getSubscriptionAccess(accessToken: string): Promise<ApplicationAccess> {
  try {
    const subscription = await apiClient.get<{
      active?: boolean;
      status?: string;
      planId?: number;
    }>(
      apiConfig.routes.subscriptions,
      { token: accessToken },
    );
    return hasActiveSubscription(subscription)
      ? { status: "active", homePath: getApplicationHomePath(subscription), source: "subscription" }
      : { status: "inactive" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status === 404) return { status: "inactive" };
    return { status: "unavailable" };
  }
}

function redirectWithCookies(request: NextRequest, path: string, response: NextResponse | null) {
  const redirectUrl = new URL(path, request.url);
  if (path === "/schedule") {
    const establishmentId = request.nextUrl.searchParams.get("establishmentId");
    if (establishmentId) {
      redirectUrl.searchParams.set("establishmentId", establishmentId);
    }
  }

  const redirectResponse = NextResponse.redirect(redirectUrl);
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
