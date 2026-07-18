import { NextResponse, type NextRequest } from "next/server";

const ORBIT_COOKIE = "marlo_orbit_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = pathname.startsWith("/orbit/");
  const isProtectedApi =
    pathname.startsWith("/api/orbit/") &&
    !pathname.startsWith("/api/orbit/auth/");

  if ((isProtectedPage || isProtectedApi) && !request.cookies.has(ORBIT_COOKIE)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/orbit", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/orbit/:path*", "/api/orbit/:path*"],
};
