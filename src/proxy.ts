import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cacheControlHeader, inferCachePolicy } from "@/lib/cache-policy";

export function proxy(request: NextRequest) {
  const policy = inferCachePolicy(
    request.nextUrl.pathname,
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
