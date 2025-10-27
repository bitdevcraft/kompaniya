import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const p = request.nextUrl.pathname;

  if (p.startsWith("/_next") || request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const headers = new Headers(request.headers);

  headers.set("x-current-path", request.nextUrl.pathname);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[^/]+$).*)",
  ],
};
