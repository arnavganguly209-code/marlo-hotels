import { NextResponse, type NextRequest } from "next/server";

const ORBIT_COOKIE = "marlo_orbit_session";
const ADMIN_COOKIE = "marlo_hotel_admin_session";

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-marlo-pathname", pathname);

    // —— Hotel Admin panel ——
    if (pathname === "/admin" || pathname === "/admin/") {
      if (request.cookies.has(ADMIN_COOKIE)) {
        const dash = request.nextUrl.clone();
        dash.pathname = "/admin/dashboard";
        dash.search = "";
        return NextResponse.redirect(dash);
      }
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    if (pathname.startsWith("/admin/")) {
      if (!request.cookies.has(ADMIN_COOKIE)) {
        const login = request.nextUrl.clone();
        login.pathname = "/admin";
        login.search = "";
        return NextResponse.redirect(login);
      }
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    if (
      pathname.startsWith("/api/admin/") &&
      !pathname.startsWith("/api/admin/auth/login")
    ) {
      if (!request.cookies.has(ADMIN_COOKIE)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // —— Orbit CMS ——
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
    console.error("[middleware] failure", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/orbit",
    "/orbit/:path*",
    "/api/orbit/:path*",
    "/admin",
    "/admin/:path*",
    "/api/admin/:path*",
    "/booking/confirmation/:path*",
  ],
};
