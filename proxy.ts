import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamSessionQueryService } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import {
  hasActiveSubscription,
} from "@/contexts/billing/domain/services/subscription-access.policy";
import { resolveApplicationHomePath } from "@/contexts/iam/domain/services/landing-path.policy";
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

  const subscriptionAccess = await getSubscriptionAccess(accessToken);

  if (subscriptionAccess.status === "unauthenticated") {
    return redirectToLogin(request);
  }

  // Do not convert an API outage into a false "no subscription" decision.
  // Protected backend endpoints remain the final authorization boundary.
  if (subscriptionAccess.status === "unavailable") {
    return response ?? NextResponse.next();
  }

  const organizationAccess = await getOrganizationAccess(accessToken);
  if (organizationAccess.status === "unauthenticated") {
    return redirectToLogin(request);
  }
  if (organizationAccess.status === "unavailable") {
    return response ?? NextResponse.next();
  }

  const workforceAccess = organizationAccess ? null : await getWorkforceAccess(accessToken);
  if (workforceAccess?.status === "unauthenticated") {
    return redirectToLogin(request);
  }

  const activeAccess =
    subscriptionAccess.status === "active" ||
    (workforceAccess?.status === "ready" && workforceAccess.access.active === true);

  const homePath = resolveApplicationHomePath({
    subscription: subscriptionAccess.subscription,
    hasOrganization: organizationAccess,
    workforceEstablishments: workforceAccess?.status === "ready" ? workforceAccess.access.establishments : [],
  });

  if (activeAccess && (pathname === "/" || pathname === "/login" || pathname === "/subscribe")) {
    return redirectWithCookies(request, homePath, response);
  }

  if (activeAccess && homePath === "/schedule" && (pathname === "/chat" || pathname.startsWith("/chat/"))) {
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

type SubscriptionAccess =
  | { status: "active"; subscription: { active?: boolean; status?: string; planId?: number } }
  | { status: "inactive" | "unauthenticated" | "unavailable" };

type WorkforceAccess =
  | { status: "ready"; access: { active?: boolean; establishments: Array<{
      organizationId: string;
      organizationName: string;
      establishmentId: string;
      establishmentName: string;
      roles?: Array<{ name: string }>;
      effectivePermissions: string[];
    }> } }
  | { status: "unauthenticated" }
  | { status: "unavailable" };

async function getSubscriptionAccess(accessToken: string): Promise<SubscriptionAccess> {
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
      ? { status: "active", subscription }
      : { status: "inactive" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status === 404) return { status: "inactive" };
    return { status: "unavailable" };
  }
}

async function getOrganizationAccess(accessToken: string): Promise<boolean | { status: "unauthenticated" | "unavailable" }> {
  try {
    await apiClient.get(apiConfig.routes.organizations, { token: accessToken });
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status === 404) return false;
    return { status: "unavailable" };
  }
}

async function getWorkforceAccess(accessToken: string): Promise<WorkforceAccess> {
  try {
    const access = await apiClient.get<{
      active?: boolean;
      establishments?: Array<{
        organizationId: string;
        organizationName: string;
        establishmentId: string;
        establishmentName: string;
        roles?: Array<{ name: string }>;
        effectivePermissions?: string[];
      }>;
    }>(apiConfig.routes.workforce.access, { token: accessToken });

    return {
      status: "ready",
      access: {
        active: access.active,
        establishments: access.establishments ?? [],
      },
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return { status: "unauthenticated" };
    if (error instanceof ApiError && error.status === 404) {
      return {
        status: "ready",
        access: {
          active: false,
          establishments: [],
        },
      };
    }
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
