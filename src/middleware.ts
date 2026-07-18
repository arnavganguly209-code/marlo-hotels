import { NextResponse, type NextRequest } from "next/server";

const ORBIT_COOKIE = "marlo_orbit_session";

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-marlo-pathname", pathname);

    // Exact /orbit login page must remain publicly reachable.
    if (pathname === "/orbit" || pathname === "/orbit/") {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    const isProtectedPage = pathname.startsWith("/orbit/");
    const isProtectedApi =
      pathname.startsWith("/api/orbit/") &&
      !pathname.startsWith("/api/orbit/auth/");

    if (
      (isProtectedPage || isProtectedApi) &&
      !request.cookies.has(ORBIT_COOKIE)
    ) {
      if (isProtectedApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = request.nextUrl.clone();
      login.pathname = "/orbit";
      login.search = "";
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    console.error("[orbit] middleware failure", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/orbit", "/orbit/:path*", "/api/orbit/:path*"],
};
