import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";
import {
  buildContentSecurityPolicy,
  buildEmbeddableContentSecurityPolicy,
  cspHeaderName,
  generateCspNonce,
} from "@/lib/csp";
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

function applyContentSecurityPolicy(response: NextResponse, pathname: string, nonce: string) {
  const embeddable = isEmbeddablePublicTipPath(pathname);
  const policy = embeddable
    ? buildEmbeddableContentSecurityPolicy({ nonce })
    : buildContentSecurityPolicy({ nonce });

  if (embeddable) {
    response.headers.delete("x-frame-options");
  }

  response.headers.set(cspHeaderName(), policy);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateCspNonce();

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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  applyContentSecurityPolicy(response, pathname, nonce);
  applyWebCacheHeaders(response, pathname);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|widget.js).*)"],
};
