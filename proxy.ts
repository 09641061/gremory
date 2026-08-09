import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { BillingApiGateway } from "@/contexts/billing/infrastructure/gateways/billing-api.gateway";
import { createIamSessionQueryService } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import { continueRequestWithSession } from "@/contexts/iam/interfaces/proxy/iam-session-request";
import { ApiError } from "@/contexts/shared/infrastructure/http/api-client";

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

  // Subscription is a capability input, never an onboarding prerequisite.
  if (pathname === "/subscribe") {
    return response ?? NextResponse.next();
  }

  const subscriptionForLanding = await getSubscriptionSnapshot(accessToken);

  const landing = await createEntryRouteQueryService().resolveRoute({
    accessToken,
    subscription: subscriptionForLanding,
  });
  if (landing.status === "unauthenticated") {
    return redirectToLogin(request);
  }
  if (landing.status === "unavailable") {
    return response ?? NextResponse.next();
  }

  if (landing.status === "organization-required" || landing.status === "establishment-required") {
    if (pathname !== landing.setupHref) {
      return redirectWithCookies(request, landing.setupHref, response);
    }
    return response ?? NextResponse.next();
  }

  const homePath = landing.homeHref;

  if (pathname === "/") {
    return redirectWithCookies(request, homePath, response);
  }

  if (homePath !== "/chat" && (pathname === "/chat" || pathname.startsWith("/chat/"))) {
    return redirectWithCookies(request, homePath, response);
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

async function getSubscriptionSnapshot(accessToken: string): Promise<{
  active?: boolean;
  status?: string;
  planId?: number;
} | null> {
  try {
    return await new BillingApiGateway().getCurrentSubscription(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    // A missing or temporarily unavailable subscription must not block onboarding.
    return null;
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

