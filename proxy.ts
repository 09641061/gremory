import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const sessionCookie = "takodu.access_token";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(sessionCookie)?.value);
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
