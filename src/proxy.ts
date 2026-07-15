import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";
import {
  buildContentSecurityPolicy,
  buildEmbeddableContentSecurityPolicy,
  cspHeaderName,
  generateCspNonce,
} from "@/lib/csp";
import {
  EARLY_ACCESS_COOKIE_NAME,
  isSignInOpen,
  isSignUpAllowed,
  isSignupOpen,
  isValidEarlyAccessToken,
  launchMode,
  waitlistRedirectPath,
} from "@/lib/launch-mode";
import {
  isBlockedPublicUsernamePath,
  isEmbeddablePublicTipPath,
} from "@/lib/public-tip-path";

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

function isEarlyAccessPath(pathname: string): boolean {
  const match = pathname.match(/^\/early-access\/([^/]+)$/);
  return Boolean(match && isValidEarlyAccessToken(match[1]));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = generateCspNonce();

  if (pathname === "/sign-in") {
    if (!isSignInOpen()) {
      const url = request.nextUrl.clone();
      url.pathname = waitlistRedirectPath();
      url.search = "";
      return NextResponse.redirect(url);
    }
  } else if (pathname === "/sign-up") {
    const allowed = isSignUpAllowed({
      eaQuery: request.nextUrl.searchParams.get("ea"),
      eaCookie: request.cookies.get(EARLY_ACCESS_COOKIE_NAME)?.value,
    });
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = waitlistRedirectPath();
      url.search = "";
      return NextResponse.redirect(url);
    }
  } else if (!isSignupOpen() && isEarlyAccessPath(pathname)) {
    // Allow redeem path while gated.
  } else if (launchMode() !== "waitlist" && pathname === "/waitlist") {
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
