export function isCookieAuthEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_AUTH_COOKIE;
  return flag !== "0" && flag !== "false";
}
