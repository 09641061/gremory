import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createIamSessionQueryService } from "@/contexts/iam/application/internal/queryservices/iam-session-query.service";
import { createEntryRouteQueryService } from "@/contexts/shared/application/internal/queryservices/entry-route-query.service";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";
import {
  workspaceSelectionCookieOptions,
  workspaceSelectionCookies,
} from "@/contexts/business/infrastructure/session/workspace-selection-cookie";
import { continueRequestWithSession } from "@/contexts/iam/interfaces/proxy/iam-session-request";

export async function proxy(request: NextRequest) {
  let accessToken = request.cookies.get(iamSessionCookies.accessToken)?.value;
  const refreshToken = request.cookies.get(iamSessionCookies.refreshToken)?.value;
  const { pathname } = request.nextUrl;
  let response: NextResponse | null = null;
  let rotatedHeaders: Headers | null = null;

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
    const rotated = continueRequestWithSession(request, session.rotatedSession);
    response = rotated.response;
    rotatedHeaders = rotated.headers;
  }

  // Subscription is a capability input, never an onboarding prerequisite.
  if (pathname === "/upgrade") {
    return continueWithWorkspaceContext(request, response, rotatedHeaders);
  }

  const landing = await createEntryRouteQueryService().resolveRoute({
    accessToken,
    organizationId: resolveOrganizationSelection(request),
    establishmentId: resolveEstablishmentSelection(request, !isOnboardingPath(pathname)),
  });
  if (landing.status === "unauthenticated") {
    return redirectToLogin(request);
  }
  if (landing.status === "unavailable") {
    return continueWithWorkspaceContext(request, response, rotatedHeaders);
  }

  if (
    landing.status === "invitation-pending" ||
    landing.status === "organization-required" ||
    landing.status === "establishment-required"
  ) {
    if (!landing.allowedPaths.includes(pathname)) {
      return redirectWithCookies(request, landing.setupHref, response);
    }
    return continueWithWorkspaceContext(request, response, rotatedHeaders);
  }

  const homePath = landing.homeHref;

  if (pathname === "/") {
    return redirectWithCookies(request, homePath, response);
  }

  if (pathname === "/welcome" && homePath !== "/welcome") {
    return redirectWithCookies(request, homePath, response);
  }

  if (homePath !== "/chat" && (pathname === "/chat" || pathname.startsWith("/chat/"))) {
    return redirectWithCookies(request, homePath, response);
  }

  return continueWithWorkspaceContext(request, response, rotatedHeaders);
}

function isPrivateRoute(pathname: string) {
  return [
    "/chat",
    "/analytics",
    "/schedule",
    "/crm",
    "/catalog",
    "/team",
    "/welcome",
    "/settings",
    "/organization",
    "/invitations/pending",
    "/organizations",
    "/establishments",
    "/access-denied",
    "/no-access",
    // Lives under app/(protected): plans are shown to signed-in users only.
    "/upgrade",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * The URL's own `establishmentId` always wins; the cookie only fills in when
 * the current request carries none - a bare link, a browser back/forward
 * step, or a redirect target that never had the chance to include it.
 */
function resolveEstablishmentSelection(request: NextRequest, useCookie = true): string | undefined {
  const fromUrl = request.nextUrl.searchParams.get("establishmentId");
  if (fromUrl) return fromUrl;
  if (!useCookie) return undefined;
  return request.cookies.get(workspaceSelectionCookies.establishmentId)?.value || undefined;
}

function isOnboardingPath(pathname: string) {
  return pathname === "/organizations/new" || pathname === "/establishments/new";
}

function resolveOrganizationSelection(request: NextRequest): string | undefined {
  const fromUrl = request.nextUrl.searchParams.get("organizationId");
  if (fromUrl) return fromUrl;
  return request.cookies.get(workspaceSelectionCookies.organizationId)?.value || undefined;
}

function redirectWithCookies(request: NextRequest, path: string, response: NextResponse | null) {
  const redirectUrl = new URL(path, request.url);
  const organizationId = resolveOrganizationSelection(request);
  const establishmentId = resolveEstablishmentSelection(request, !isOnboardingPath(request.nextUrl.pathname));
  if (organizationId) redirectUrl.searchParams.set("organizationId", organizationId);
  if (establishmentId) redirectUrl.searchParams.set("establishmentId", establishmentId);

  const redirectResponse = NextResponse.redirect(redirectUrl);
  if (response) {
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
  }
  if (isOnboardingPath(request.nextUrl.pathname) && !request.nextUrl.searchParams.has("establishmentId")) {
    redirectResponse.cookies.delete(workspaceSelectionCookies.establishmentId);
  }
  persistEstablishmentSelection(request, redirectResponse);
  return redirectResponse;
}

function continueWithWorkspaceContext(
  request: NextRequest,
  response: NextResponse | null,
  rotatedHeaders: Headers | null = null,
) {
  const urlEstablishmentId = request.nextUrl.searchParams.get("establishmentId");
  const establishmentId = urlEstablishmentId || resolveEstablishmentSelection(
    request,
    !isOnboardingPath(request.nextUrl.pathname),
  );
  const forwardedHeaders = new Headers(rotatedHeaders ?? request.headers);

  forwardedHeaders.delete("x-takodu-organization-id");
  if (establishmentId) forwardedHeaders.set("x-takodu-establishment-id", establishmentId);
  else forwardedHeaders.delete("x-takodu-establishment-id");

  // The URL itself is what `searchParams` resolves from in every page and
  // layout downstream, so a cookie-only selection has to be rewritten into it
  // - a forwarded header alone would leave those reads empty. The browser's
  // own address bar is untouched: this is an internal rewrite, not a redirect.
  const nextResponse = !urlEstablishmentId && establishmentId
    ? rewriteWithEstablishment(request, establishmentId, forwardedHeaders)
    : NextResponse.next({ request: { headers: forwardedHeaders } });

  copyResponseCookies(response, nextResponse);
  if (isOnboardingPath(request.nextUrl.pathname) && !urlEstablishmentId) {
    nextResponse.cookies.delete(workspaceSelectionCookies.establishmentId);
  }
  persistEstablishmentSelection(request, nextResponse);
  return nextResponse;
}

function rewriteWithEstablishment(request: NextRequest, establishmentId: string, headers: Headers) {
  const rewrittenUrl = new URL(request.nextUrl);
  rewrittenUrl.searchParams.set("establishmentId", establishmentId);
  return NextResponse.rewrite(rewrittenUrl, { request: { headers } });
}

/** Only an explicit selection in the URL updates what gets remembered. */
function persistEstablishmentSelection(request: NextRequest, target: NextResponse) {
  const fromUrl = request.nextUrl.searchParams.get("establishmentId");
  if (!fromUrl) return;
  if (request.cookies.get(workspaceSelectionCookies.establishmentId)?.value === fromUrl) return;
  target.cookies.set(workspaceSelectionCookies.establishmentId, fromUrl, workspaceSelectionCookieOptions);
}

function copyResponseCookies(source: NextResponse | null, target: NextResponse) {
  if (!source) return;
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
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
    "/upgrade",
    "/chat/:path*",
    "/analytics/:path*",
    "/schedule/:path*",
    "/crm/:path*",
    "/catalog/:path*",
    "/team/:path*",
    "/welcome",
    "/settings/:path*",
    "/organization/:path*",
    "/invitations/pending",
    "/organizations/:path*",
    "/establishments/:path*",
    "/access-denied/:path*",
    "/no-access/:path*",
  ],
};
