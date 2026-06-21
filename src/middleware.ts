import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";
import { buildEmbeddableContentSecurityPolicy, cspHeaderName } from "@/lib/csp";
import {
  isBlockedPublicUsernamePath,
  isEmbeddablePublicTipPath,
} from "@/lib/public-tip-path";

function applyWebCacheHeaders(response: NextResponse, pathname: string) {
  const policy = inferCachePolicy(pathname);
  response.headers.set("X-Cache-Policy", policy);
  response.headers.set("Cache-Control", cacheControlHeader(policy));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
