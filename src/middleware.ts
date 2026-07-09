import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";
import { cspHeaderName, buildEmbeddableContentSecurityPolicy } from "@/lib/csp";
import { isSignupOpen, launchMode, waitlistRedirectPath } from "@/lib/launch-mode";
import {
  isBlockedPublicUsernamePath,
  isEmbeddablePublicTipPath,
} from "@/lib/public-tip-path";

const AUTH_PATHS = new Set(["/sign-in", "/sign-up"]);

function applyWebCacheHeaders(response: NextResponse, pathname: string) {
  const policy = inferCachePolicy(pathname);
  response.headers.set("X-Cache-Policy", policy);
  response.headers.set("Cache-Control", cacheControlHeader(policy));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSignupOpen() && AUTH_PATHS.has(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = waitlistRedirectPath();
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (launchMode() !== "waitlist" && pathname === "/waitlist") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isBlockedPublicUsernamePath(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.next();

  if (isEmbeddablePublicTipPath(pathname)) {
    response.headers.delete("x-frame-options");
    response.headers.delete("content-security-policy");
    response.headers.delete("content-security-policy-report-only");
    response.headers.set(cspHeaderName(), buildEmbeddableContentSecurityPolicy());
  }

  applyWebCacheHeaders(response, pathname);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|widget.js).*)"],
};
