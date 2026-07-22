import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { iamCookies } from "@/contexts/iam/interfaces/cookies";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(iamCookies.accessToken)?.value);
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
