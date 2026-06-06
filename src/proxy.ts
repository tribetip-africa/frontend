import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isProtectedPath } from "@/lib/protected-routes";
import { AUTH_SESSION_COOKIE } from "@/lib/auth-cookie";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtectedPath(pathname) && !request.cookies.get(AUTH_SESSION_COOKIE)) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const policy = inferCachePolicy(
    pathname,
    request.headers.has("authorization"),
  );

  const response = NextResponse.next();
  response.headers.set("Cache-Control", cacheControlHeader(policy));
  response.headers.set("X-Cache-Policy", policy);

  if (policy === "noStore") {
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
