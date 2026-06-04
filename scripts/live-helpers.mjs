import { existsSync } from "node:fs";

export const API_BASE = process.env.LIVE_API_URL ?? "http://127.0.0.1:3001";
export const WEB_BASE = process.env.LIVE_WEB_URL ?? "http://localhost:3000";

export function resolveTribetipDir() {
  if (process.env.TRIBETIP_DIR) return process.env.TRIBETIP_DIR;

  const candidates = [
    new URL("../tribetip", import.meta.url).pathname,
    new URL("../../tribetip", import.meta.url).pathname,
  ];

  for (const dir of candidates) {
    if (existsSync(`${dir}/bin/rails`)) return dir;
  }

  throw new Error("tribetip API directory not found (set TRIBETIP_DIR)");
}

export function assertStructuredError(body, { code, status }) {
  if (!body?.error || typeof body.error !== "object") {
    throw new Error(`Expected structured error payload, got: ${JSON.stringify(body)}`);
  }
  if (body.error.code !== code) {
    throw new Error(`Expected error.code=${code}, got: ${body.error.code}`);
  }
  if (!body.error.message || typeof body.error.message !== "string") {
    throw new Error(`Expected error.message string, got: ${JSON.stringify(body.error)}`);
  }
  if (status !== undefined && body.error.status !== undefined && body.error.status !== status) {
    throw new Error(`Unexpected error.status in payload: ${body.error.status}`);
  }
}

export async function apiRequest(method, path, { body, headers = {} } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Origin: WEB_BASE,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

export function assertNoStore(headers, route) {
  const cacheControl = (headers["cache-control"] ?? headers.get?.("cache-control")) ?? "";
  const policy = headers["x-cache-policy"] ?? headers.get?.("x-cache-policy") ?? "";
  const isSecure =
    cacheControl.includes("no-store") ||
    cacheControl.includes("no-cache") ||
    cacheControl.includes("private") ||
    policy === "noStore";
  if (!isSecure) {
    throw new Error(`${route} expected no-store cache, got: ${cacheControl || policy || "(empty)"}`);
  }
}

export function assertPublicShort(headers, route) {
  const cacheControl = (headers["cache-control"] ?? headers.get?.("cache-control")) ?? "";
  if (!cacheControl.includes("public") || !cacheControl.includes("max-age=60")) {
    throw new Error(`${route} expected public short cache, got: ${cacheControl}`);
  }
}

export function assertCspPresent(headers, route) {
  const csp =
    headers["content-security-policy-report-only"] ??
    headers["content-security-policy"] ??
    headers.get?.("content-security-policy-report-only") ??
    headers.get?.("content-security-policy");
  if (!csp) {
    throw new Error(`${route} expected CSP header, got none`);
  }
  if (!csp.includes("connect-src") || !csp.includes("frame-ancestors 'none'")) {
    throw new Error(`${route} CSP missing expected directives: ${csp}`);
  }
}

export async function apiSignUp({ username, email, password = "securepass123" }) {
  const response = await fetch(`${API_BASE}/tribes.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: WEB_BASE,
    },
    body: JSON.stringify({
      tribe: {
        email,
        password,
        password_confirmation: password,
        username,
        country_code: "NG",
        currency: "NGN",
      },
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`API signup failed (${response.status}): ${JSON.stringify(data)}`);
  }
  return { response, data };
}

export async function enablePublicProfile(username) {
  const { execSync } = await import("node:child_process");
  const tribetipDir = resolveTribetipDir();

  execSync(
    `bin/rails runner "t = Tribe.find_by!(username: '${username}'); t.update!(display_name: 'Live Test', is_profile_public: true, account_status: 'active')"`,
    { cwd: tribetipDir, stdio: "pipe" },
  );
}

export async function waitForServices() {
  const checks = [
    { name: "API", url: `${API_BASE}/up` },
    { name: "Web", url: `${WEB_BASE}/sign-up` },
  ];

  for (const { name, url } of checks) {
    let lastError = null;
    for (let attempt = 1; attempt <= 30; attempt++) {
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (response.ok) {
          console.log(`   ${name} ready (${url})`);
          break;
        }
        lastError = new Error(`${name} returned ${response.status}`);
      } catch (error) {
        lastError = error;
      }
      if (attempt === 30) throw lastError ?? new Error(`${name} not ready`);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}
