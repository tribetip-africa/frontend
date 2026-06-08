export const PROTECTED_PATHS = ["/dashboard"] as const;

export const MARKETING_PATHS = ["/", "/sign-in", "/sign-up"] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function isMarketingPath(pathname: string): boolean {
  return MARKETING_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function normalizeAuthRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/")) return "/dashboard";
  if (path === "/admin" || path.startsWith("/admin/")) return "/dashboard";
  return path;
}
