import "server-only";

import { NextRequest, NextResponse } from "next/server";
import type { AuthenticationSession } from "../../domain/model/entities/authentication-session";
import {
  iamSessionCookieMaxAge,
  iamSessionCookieOptions,
  iamSessionCookies,
} from "../../infrastructure/session/iam-session-cookie";

export type SessionRotationResult = {
  response: NextResponse;
  headers: Headers;
};

export function continueRequestWithSession(
  request: NextRequest,
  session: AuthenticationSession,
): SessionRotationResult {
  const forwardedRequest = new NextRequest(request.url, {
    headers: request.headers,
  });
  forwardedRequest.cookies.set(iamSessionCookies.accessToken, session.accessToken);
  forwardedRequest.cookies.set(iamSessionCookies.refreshToken, session.refreshToken);

  const response = NextResponse.next({
    request: { headers: forwardedRequest.headers },
  });
  persistSessionCookies(response, session);
  return { response, headers: forwardedRequest.headers };
}

export function persistSessionCookies(
  response: NextResponse,
  session: AuthenticationSession,
): void {
  response.cookies.set(iamSessionCookies.accessToken, session.accessToken, {
    ...iamSessionCookieOptions,
    maxAge: iamSessionCookieMaxAge.accessToken,
  });
  response.cookies.set(iamSessionCookies.refreshToken, session.refreshToken, {
    ...iamSessionCookieOptions,
    maxAge: iamSessionCookieMaxAge.refreshToken,
  });
}
