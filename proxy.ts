import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { iamSessionCookies } from "@/contexts/iam/infrastructure/session/iam-session-cookie";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(
    request.cookies.get(iamSessionCookies.accessToken)?.value
  );
  const { pathname } = request.nextUrl;

  if (pathname === "/" && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login"],
};
