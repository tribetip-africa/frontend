import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readEnvLocalLaunchMode() {
  const envPath = path.join(frontendRoot, ".env.local");
  if (!existsSync(envPath)) return null;

  const match = readFileSync(envPath, "utf8").match(
    /^\s*NEXT_PUBLIC_LAUNCH_MODE\s*=\s*([^\s#]+)/m,
  );
  return match?.[1]?.trim().toLowerCase() ?? null;
}

export const API_BASE = process.env.LIVE_API_URL ?? "http://127.0.0.1:3001";
export const WEB_BASE = process.env.LIVE_WEB_URL ?? "http://localhost:3000";

export function liveLaunchMode() {
  const raw =
    process.env.LIVE_LAUNCH_MODE ??
    process.env.NEXT_PUBLIC_LAUNCH_MODE ??
    readEnvLocalLaunchMode() ??
    "open";
  const mode = raw.trim().toLowerCase();
  if (mode === "waitlist" || mode === "coming_soon") return mode;
  return "open";
}

export function isLiveSignupOpen() {
  return liveLaunchMode() === "open";
}

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

function dockerRailsContainer() {
  return process.env.TRIBETIP_DOCKER_CONTAINER ?? "tribetip-api-1";
}

function isDockerRailsRunner() {
  return process.env.LIVE_API_RUNNER === "docker";
}

function runRailsRunner(script, { encoding } = {}) {
  const command = isDockerRailsRunner()
    ? `docker exec ${dockerRailsContainer()} bin/rails runner ${JSON.stringify(script)}`
    : `bin/rails runner ${JSON.stringify(script)}`;
  const options = {
    stdio: "pipe",
    env: process.env,
    ...(encoding ? { encoding } : {}),
  };

  if (!isDockerRailsRunner()) {
    options.cwd = resolveTribetipDir();
  }

  return execSync(command, options);
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

export const PAYSTACK_REGIONS = [
  { code: "NG", currency: "NGN", bank: "057", bankName: "Zenith Bank", subaccountSupported: true },
  { code: "GH", currency: "GHS", bank: "MTN", bankName: "MTN Mobile Money", subaccountSupported: true },
  { code: "KE", currency: "KES", bank: "68", bankName: "KCB Bank", subaccountSupported: true },
  { code: "ZA", currency: "ZAR", bank: "632005", bankName: "ABSA Bank", subaccountSupported: true },
  { code: "CI", currency: "XOF", bank: null, bankName: null, subaccountSupported: false },
];

export async function apiSignUp({
  username,
  email,
  password = "securepass123",
  country_code = "KE",
  currency,
  retries = 5,
} = {}) {
  const region = PAYSTACK_REGIONS.find((entry) => entry.code === country_code) ?? PAYSTACK_REGIONS[0];

  for (let attempt = 0; attempt <= retries; attempt += 1) {
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
          country_code: region.code,
          currency: currency ?? region.currency,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      return { response, data };
    }

    if (response.status === 429 && attempt < retries) {
      const waitMs = 8_000 * (attempt + 1);
      console.log(`   … signup rate limited, retrying in ${waitMs / 1000}s`);
      await sleep(waitMs);
      continue;
    }

    throw new Error(`API signup failed (${response.status}): ${JSON.stringify(data)}`);
  }

  throw new Error("API signup failed after retries");
}

export async function apiSignIn({ login, password = "securepass123" }) {
  const response = await fetch(`${API_BASE}/tribes/sign_in.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Origin: WEB_BASE,
    },
    body: JSON.stringify({ tribe: { login, password } }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`API sign-in failed (${response.status}): ${JSON.stringify(data)}`);
  }

  const authorization = response.headers.get("Authorization") ?? "";
  const token =
    data.token ??
    (authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null);

  if (!token) {
    throw new Error("API sign-in succeeded without a token");
  }

  return { response, data, token };
}

function cookieAuthEnabledInLiveTests() {
  const flag = process.env.NEXT_PUBLIC_AUTH_COOKIE;
  return flag !== "0" && flag !== "false";
}

function cookiesFromSignInResponse(response) {
  const apiHost = new URL(API_BASE).hostname;
  const headers =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];

  return headers.flatMap((header) => {
    const [pair, ...attrs] = header.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0) return [];

    const name = pair.slice(0, eq).trim();
    const value = pair.slice(eq + 1).trim();
    const attrMap = Object.fromEntries(
      attrs.map((part) => {
        const [key, ...rest] = part.trim().split("=");
        return [key.toLowerCase(), rest.join("=") || true];
      }),
    );

    return [
      {
        name,
        value,
        domain: apiHost,
        path: typeof attrMap.path === "string" ? attrMap.path : "/",
        httpOnly: Boolean(attrMap.httponly),
        secure: Boolean(attrMap.secure),
        sameSite: "Lax",
      },
    ];
  });
}

export async function signInPageSession(page, { login, password = "securepass123" }) {
  const { token, data, response } = await apiSignIn({ login, password });
  const cookieAuth = cookieAuthEnabledInLiveTests();
  const authCookies = cookiesFromSignInResponse(response);

  if (authCookies.length > 0) {
    await page.context().addCookies(authCookies);
  }

  await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ sessionToken, tribe, csrfToken, cookieAuth: useCookies }) => {
      localStorage.setItem("tribetip_tribe", JSON.stringify(tribe));
      document.cookie = "tribetip_session=1; path=/; max-age=86400; samesite=lax";
      if (csrfToken) {
        sessionStorage.setItem("tribetip_csrf", csrfToken);
      }
      if (useCookies) {
        localStorage.removeItem("tribetip_token");
      } else if (sessionToken) {
        localStorage.setItem("tribetip_token", sessionToken);
      }
    },
    {
      sessionToken: token,
      tribe: data.tribe,
      csrfToken: data.csrf_token ?? null,
      cookieAuth,
    },
  );
  await page.goto(`${WEB_BASE}/dashboard`, { waitUntil: "domcontentloaded" });

  return { token, tribe: data.tribe };
}

export async function railsRunner(script) {
  runRailsRunner(script);
}

export async function clearPaystackOnboarding(username) {
  await railsRunner(
    `t = Tribe.find_by!(username: ${JSON.stringify(username)}); t.update!(paystack_customer_code: nil, paystack_subaccount_code: nil, onboarding_completed_at: nil)`,
  );
}

export async function clearPaystackSubaccount(username) {
  await railsRunner(
    `t = Tribe.find_by!(username: ${JSON.stringify(username)}); t.update!(paystack_subaccount_code: nil, onboarding_completed_at: nil)`,
  );
}

export async function enablePublicProfile(username) {
  await railsRunner(
    [
      "t = Tribe.find_by!(username: " + JSON.stringify(username) + ")",
      "t.update!(display_name: 'Live Test', is_profile_public: true, account_status: 'active')",
      "t.mark_paystack_onboarding_complete! if t.paystack_subaccount_ready?",
    ].join("; "),
  );
}

export function assertPaystackOnboarding(data, { complete = true } = {}) {
  const onboarding =
    data?.onboarding ?? data?.tribe?.paystack_onboarding ?? data?.paystack_onboarding;
  if (!onboarding) {
    throw new Error(`Expected paystack_onboarding in payload: ${JSON.stringify(data)}`);
  }
  if (complete) {
    if (onboarding.complete !== true) {
      throw new Error(
        `Expected paystack_onboarding.complete=true, got: ${JSON.stringify(onboarding)}`,
      );
    }
    return;
  }

  if (onboarding.complete !== false) {
    throw new Error(
      `Expected paystack_onboarding.complete=false, got: ${JSON.stringify(onboarding)}`,
    );
  }
}

export function assertPaystackOnboardingLinked(data) {
  const onboarding =
    data?.onboarding ?? data?.tribe?.paystack_onboarding ?? data?.paystack_onboarding;
  if (!isOnboardingLinked(onboarding)) {
    throw new Error(`Expected linked paystack onboarding, got: ${JSON.stringify(onboarding)}`);
  }
}

export function assertRegionMarket(data, region) {
  const market =
    data?.market ??
    data?.tribe?.paystack_onboarding?.market ??
    data?.paystack_onboarding?.market;

  if (!market) {
    throw new Error(`Expected market in payload: ${JSON.stringify(data)}`);
  }
  if (market.country_code !== region.code) {
    throw new Error(`Expected market ${region.code}, got ${market.country_code}`);
  }
  if (market.currency !== region.currency) {
    throw new Error(`Expected currency ${region.currency}, got ${market.currency}`);
  }
  if (market.subaccount_supported !== region.subaccountSupported) {
    throw new Error(
      `Expected subaccount_supported=${region.subaccountSupported}, got ${market.subaccount_supported}`,
    );
  }
}

export function regionUsername(prefix, regionCode) {
  return `${prefix}_${regionCode.toLowerCase()}_${Date.now()}`;
}

export function supportedRegions() {
  return PAYSTACK_REGIONS.filter((region) => region.subaccountSupported);
}

export async function fetchPaystackAccounts(username) {
  const script = [
    "t = Tribe.find_by!(username: " + JSON.stringify(username) + ")",
    "puts [t.paystack_customer_code, t.paystack_subaccount_code, t.country_code, t.currency, t.onboarding_completed_at.present?].join('|')",
  ].join("; ");

  const output = runRailsRunner(script, { encoding: "utf-8" }).trim();

  const [customerCode, subaccountCode, countryCode, currency, onboardingComplete] =
    output.split("|");

  return {
    customerCode: customerCode === "" ? null : customerCode,
    subaccountCode: subaccountCode === "" ? null : subaccountCode,
    countryCode,
    currency,
    onboardingComplete: onboardingComplete === "true",
  };
}

export function assertPaystackAccounts(accounts, region, { customer = true, subaccount = false, complete = false } = {}) {
  if (accounts.countryCode !== region.code) {
    throw new Error(`Expected country ${region.code}, got ${accounts.countryCode}`);
  }
  if (accounts.currency !== region.currency) {
    throw new Error(`Expected currency ${region.currency}, got ${accounts.currency}`);
  }
  if (customer && !accounts.customerCode) {
    throw new Error(`Expected Paystack customer code for ${region.code}`);
  }
  if (subaccount && !accounts.subaccountCode) {
    throw new Error(`Expected Paystack subaccount code for ${region.code}`);
  }
  if (complete && !accounts.onboardingComplete) {
    throw new Error(`Expected onboarding_completed_at for ${region.code}`);
  }
}

export const KE_MPESA_LINE = "0712345678";

export function pickSettlementBank(banks, { preferName, preferMpesa = false } = {}) {
  if (!Array.isArray(banks) || banks.length === 0) {
    throw new Error("Expected at least one settlement bank");
  }

  if (preferMpesa) {
    const mpesa =
      banks.find((bank) => bank.code === "MPESA") ??
      banks.find((bank) => bank.mobile_money && bank.name?.toLowerCase().includes("m-pesa"));
    if (mpesa) return mpesa;
  }

  if (preferName) {
    const preferred = banks.find((bank) =>
      bank.name?.toLowerCase().includes(preferName.toLowerCase()),
    );
    if (preferred) return preferred;
  }

  return banks[0];
}

export function createIdempotencyKey() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  );
}

function onboardingScope(page) {
  return page.getByRole("dialog");
}

export async function completeStubOnboardingUI(page, { countryCode = "NG" } = {}) {
  await onboardingScope(page).waitFor({ state: "visible", timeout: 30_000 });
  await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 90_000 });
  await waitForPaystackCustomerReady(page);

  const region = PAYSTACK_REGIONS.find((entry) => entry.code === countryCode) ?? PAYSTACK_REGIONS[0];
  const bankField = onboardingScope(page).locator("#settlement_bank");
  await bankField.waitFor({ state: "visible", timeout: 30_000 });

  const fieldTag = await bankField.evaluate((node) => node.tagName.toLowerCase());
  if (fieldTag === "select") {
    if (region.bank) {
      await page.selectOption("#settlement_bank", region.bank);
    } else {
      const firstValue = await bankField.locator("option").first().getAttribute("value");
      if (firstValue) await page.selectOption("#settlement_bank", firstValue);
    }
  } else {
    await setReactInput(page, "#settlement_bank", region.bank ?? "057");
  }

  await setReactInput(page, "#account_number", "0000000000");

  const submit = onboardingScope(page).getByRole("button", { name: /link payout account/i });
  await submit.waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForFunction(
    () => {
      const dialog = document.querySelector('[role="dialog"]');
      const button = dialog
        ? [...dialog.querySelectorAll("button")].find((node) =>
            /link payout account/i.test(node.textContent ?? ""),
          )
        : null;
      return button && !button.disabled;
    },
    { timeout: 90_000 },
  );

  const onboardingResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/me/paystack/onboarding") &&
      response.request().method() === "POST",
    { timeout: 90_000 },
  );
  await submit.click();

  const response = await onboardingResponse;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok()) {
    const message = payload?.error?.message ?? `HTTP ${response.status()}`;
    throw new Error(`Onboarding API failed: ${message}`);
  }
  if (!payload?.onboarding?.complete) {
    throw new Error(`Onboarding API incomplete: ${JSON.stringify(payload?.onboarding)}`);
  }

  await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 30_000 });
}

export async function completeOnboardingAfterSignup(page, { mode, countryCode }) {
  const path = new URL(page.url()).pathname;
  if (path !== "/dashboard") return;

  const dialog = page.getByRole("dialog");
  const openSetup = page.getByRole("button", { name: /link payout account/i });

  if ((await dialog.count()) === 0 && (await openSetup.count()) === 0) {
    await Promise.race([
      dialog.waitFor({ state: "visible", timeout: 30_000 }),
      openSetup.first().waitFor({ state: "visible", timeout: 30_000 }),
    ]).catch(() => {});
  }

  if ((await dialog.count()) === 0) {
    if ((await openSetup.count()) === 0) return;
    await openSetup.first().click();
    await dialog.waitFor({ state: "visible", timeout: 30_000 });
  }

  if (mode === "live") {
    await completeMpesaOnboardingUI(page);
  } else {
    await completeStubOnboardingUI(page, { countryCode });
  }
}

export async function assertDashboardShowsUsername(page, username) {
  const handle = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  await page.getByText(new RegExp(`@${handle}`)).first().waitFor({
    state: "visible",
    timeout: 30_000,
  });
}

export async function clickDashboardSignOut(page) {
  await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 60_000 });
  const button = page.getByRole("button", { name: /sign out/i }).first();
  await button.waitFor({ state: "visible", timeout: 30_000 });
  await button.click();
}

export async function waitForDashboardOnboardingClear(
  page,
  { mode, countryCode, username, timeoutMs = 120_000 } = {},
) {
  if (mode === "live" && username) {
    await waitForPaystackSubaccountLinked(username, { timeoutMs });
  }

  const dialog = page.getByRole("dialog");
  if ((await dialog.count()) === 0) return;

  try {
    await dialog.waitFor({ state: "hidden", timeout: timeoutMs });
    return;
  } catch {
    if ((await dialog.count()) === 0) return;
  }

  await completeOnboardingAfterSignup(page, { mode, countryCode });
  await dialog.waitFor({ state: "hidden", timeout: timeoutMs });
}

export async function completeRegionOnboarding(token, region, { bankCode, accountNumber, idempotencyKey } = {}) {
  return apiRequest("POST", "/me/paystack/onboarding", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Idempotency-Key": idempotencyKey ?? createIdempotencyKey(),
    },
    body: {
      onboarding: {
        settlement_bank: bankCode ?? region.bank,
        account_number: accountNumber ?? "0000000000",
        business_name: `${region.code} Creator`,
      },
    },
  });
}

export async function completeOnboardingFromPayload(token, payload, regionCode, options = {}) {
  const bank = pickSettlementBank(payload.banks, {
    preferMpesa: options.preferMpesa === true,
    preferName: options.preferMpesa ? undefined : regionCode === "KE" ? "KCB" : undefined,
  });
  const accountNumber =
    options.accountNumber ??
    (options.preferMpesa || bank.code === "MPESA" ? KE_MPESA_LINE : "0000000000");

  return completeRegionOnboarding(
    token,
    PAYSTACK_REGIONS.find((region) => region.code === regionCode) ?? { code: regionCode },
    { bankCode: bank.code, accountNumber },
  );
}

export async function waitForPaystackCustomer(username, { timeoutMs = 30_000 } = {}) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const accounts = await fetchPaystackAccounts(username);
    if (accounts.customerCode) return accounts;
    await sleep(500);
  }

  throw new Error(`Timed out waiting for Paystack customer for ${username}`);
}

export async function waitForPaystackSubaccountLinked(username, { timeoutMs = 60_000 } = {}) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const accounts = await fetchPaystackAccounts(username);
    if (accounts.customerCode && accounts.subaccountCode) return accounts;
    await sleep(500);
  }

  throw new Error(`Timed out waiting for Paystack subaccount for ${username}`);
}

export async function waitForPaystackOnboarding(username, { timeoutMs = 60_000 } = {}) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const accounts = await fetchPaystackAccounts(username);
    if (accounts.customerCode && accounts.subaccountCode && accounts.onboardingComplete) {
      return accounts;
    }
    await sleep(500);
  }

  throw new Error(`Timed out waiting for Paystack onboarding for ${username}`);
}

export function assertRealPaystackCode(code, { label, allowStub = false } = {}) {
  if (!code) {
    throw new Error(`Expected ${label ?? "Paystack"} code`);
  }
  if (allowStub) return;
  if (code.startsWith("cus_stub_") || code.startsWith("acct_stub_")) {
    throw new Error(`Expected live Paystack code, got stub: ${code}`);
  }
}

export async function fetchLaunchRegions() {
  const response = await fetch(`${API_BASE}/regions`, {
    headers: { Accept: "application/json", Origin: WEB_BASE },
  });
  if (!response.ok) {
    throw new Error(`regions API failed (${response.status})`);
  }
  return response.json();
}

export async function enabledPaystackRegions() {
  const payload = await fetchLaunchRegions();
  const enabledCodes = new Set(
    payload.regions.filter((region) => region.enabled).map((region) => region.code),
  );
  return PAYSTACK_REGIONS.filter((region) => enabledCodes.has(region.code));
}

export async function regionsForLiveTests() {
  const mode = await paystackClientMode();
  const enabled = await enabledPaystackRegions();
  if (mode === "live") {
    return enabled.filter((region) => region.code === "KE" || !region.subaccountSupported);
  }
  return enabled;
}

export async function supportedRegionsForLiveTests() {
  const mode = await paystackClientMode();
  const enabled = await enabledPaystackRegions();
  if (mode === "live") {
    return enabled.filter((region) => region.code === "KE" && region.subaccountSupported);
  }
  return enabled.filter((region) => region.subaccountSupported);
}

export async function paystackClientMode() {
  if (process.env.LIVE_PAYSTACK_MODE === "stub") return "stub";
  if (process.env.LIVE_PAYSTACK_MODE === "live") return "live";

  const output = runRailsRunner("puts Tribetip::Paystack::Client.new.stub_mode?", {
    encoding: "utf-8",
  }).trim();
  return output === "false" ? "live" : "stub";
}

export async function apiPublishProfile(token) {
  return apiRequest("POST", "/me/profile/publish", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function auditPaystackOnboarding(username, { sync = false } = {}) {
  const script = `puts Tribetip::Paystack::AuditOnboarding.call(Tribe.find_by!(username: ${JSON.stringify(username)}), sync: ${sync}).as_json.to_json`;

  const output = runRailsRunner(script, { encoding: "utf-8" }).trim();

  return JSON.parse(output);
}

export async function fetchLatestTip(username) {
  const script = [
    "t = Tribe.find_by!(username: " + JSON.stringify(username) + ")",
    "tip = t.tips.order(created_at: :desc).first",
    "puts [tip&.currency, tip&.amount_cents, tip&.status].join('|')",
  ].join("; ");

  const output = runRailsRunner(script, { encoding: "utf-8" }).trim();

  const [currency, amountCents, status] = output.split("|");
  if (!currency) return null;

  return {
    currency,
    amountCents: Number(amountCents),
    status,
  };
}

export async function setupTippableCreator(region, { prefix = "tips" } = {}) {
  const password = "securepass123";
  const username = regionUsername(prefix, region.code);
  const email = `${username}@tribetip.africa`;
  const mode = await paystackClientMode();

  await apiSignUp({ username, email, password, country_code: region.code });

  if (region.subaccountSupported) {
    let accounts = await fetchPaystackAccounts(username);
    if (!accounts.subaccountCode) {
      const { token } = await apiSignIn({ login: username, password });
      let linked;
      if (mode === "live" && region.code === "KE") {
        const status = await apiRequest("GET", "/me/paystack/onboarding", {
          headers: { Authorization: `Bearer ${token}` },
        });
        linked = await completeOnboardingFromPayload(token, status.data, "KE", {
          preferMpesa: true,
        });
      } else {
        linked = await completeRegionOnboarding(token, region);
      }
      if (linked.response.status !== 200) {
        throw new Error(`onboarding failed for ${region.code}: ${JSON.stringify(linked.data)}`);
      }
    }

    if (mode === "live") {
      accounts = await waitForPaystackSubaccountLinked(username);
      if (!accounts.subaccountCode) {
        throw new Error(`Expected Paystack subaccount for ${region.code}`);
      }
    } else {
      const audit = await auditPaystackOnboarding(username, { sync: true });
      if (!audit.healthy) {
        throw new Error(`Paystack audit unhealthy for ${region.code}: ${JSON.stringify(audit.checks)}`);
      }
    }
  }

  await enablePublicProfile(username);
  return { username, password, region };
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function setReactInput(page, selector, value) {
  await page.locator(selector).evaluate((element, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    );
    descriptor?.set?.call(element, nextValue);
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

async function waitForPaystackCustomerReady(page) {
  const linked = page.getByText("✓ Paystack customer linked");
  const retry = page.getByRole("button", { name: /retry customer check/i });
  const bankField = page.locator("#settlement_bank");

  for (let attempt = 0; attempt < 12; attempt += 1) {
    if (await linked.isVisible().catch(() => false)) return;
    if (await bankField.isVisible().catch(() => false)) return;

    if (await retry.isVisible().catch(() => false)) {
      await retry.click();
      await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 90_000 });
    } else {
      await sleep(5_000);
    }
  }

  if (await linked.isVisible().catch(() => false)) return;
  await bankField.waitFor({ state: "visible", timeout: 30_000 });
}

export async function completeMpesaOnboardingUI(
  page,
  { line = KE_MPESA_LINE, dashboardTimeout = 90_000, marketName = "Kenya" } = {},
) {
  await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 90_000 });
  await page.getByText(new RegExp(`Payout market:.*${marketName}`, "i")).waitFor({
    timeout: 15_000,
  });
  await waitForPaystackCustomerReady(page);

  let bankSelected = false;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const bankField = page.locator("#settlement_bank");
    if (!(await bankField.isVisible().catch(() => false))) {
      await waitForPaystackCustomerReady(page);
      await sleep(3_000);
      continue;
    }

    const fieldTag = await bankField.evaluate((node) => node.tagName.toLowerCase());
    if (fieldTag === "select") {
      try {
        await page.locator('#settlement_bank option[value="MPESA"]').waitFor({
          state: "attached",
          timeout: 15_000,
        });
        await page.selectOption("#settlement_bank", "MPESA");
        bankSelected = true;
        break;
      } catch {
        const retry = page.getByRole("button", { name: /retry customer check/i });
        if (await retry.isVisible().catch(() => false)) {
          await retry.click();
          await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 90_000 });
        } else {
          await sleep(5_000);
        }
        await waitForPaystackCustomerReady(page);
      }
    } else {
      await setReactInput(page, "#settlement_bank", "MPESA");
      bankSelected = true;
      break;
    }
  }

  if (!bankSelected) {
    const pageText = await page.locator("main").innerText().catch(() => "");
    throw new Error(
      `Could not select M-PESA settlement bank on onboarding form. Page: ${pageText.slice(0, 800)}`,
    );
  }

  await setReactInput(page, "#account_number", line);

  const submit = onboardingScope(page).getByRole("button", { name: /link payout account/i });
  await submit.waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForFunction(
    () => {
      const dialog = document.querySelector('[role="dialog"]');
      const button = dialog
        ? [...dialog.querySelectorAll("button")].find((node) =>
            /link payout account/i.test(node.textContent ?? ""),
          )
        : null;
      return button && !button.disabled;
    },
    { timeout: 90_000 },
  );

  const onboardingResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/me/paystack/onboarding") &&
      response.request().method() === "POST",
    { timeout: dashboardTimeout },
  );
  await submit.click();

  const response = await onboardingResponse;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok()) {
    const message = payload?.error?.message ?? `HTTP ${response.status()}`;
    throw new Error(`Onboarding API failed: ${message}`);
  }
  if (!isOnboardingLinked(payload?.onboarding)) {
    throw new Error(`Onboarding API incomplete: ${JSON.stringify(payload?.onboarding)}`);
  }

  try {
    await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 60_000 });
  } catch (error) {
    const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
    const buttonText = await submit.textContent().catch(() => null);
    const checks = await page.locator("main li").allTextContents().catch(() => []);
    const details = [
      alert?.trim() && `alert: ${alert.trim()}`,
      buttonText?.trim() && `button: ${buttonText.trim()}`,
      checks.length > 0 && `checks: ${checks.join("; ")}`,
    ]
      .filter(Boolean)
      .join(" | ");
    throw new Error(details || error.message);
  }
}

function isOnboardingLinked(onboarding) {
  if (!onboarding) return false;
  return (
    onboarding.complete === true ||
    (onboarding.customer_ready === true && onboarding.subaccount_ready === true)
  );
}

function isPaystackRateLimitResponse({ response, data }) {
  if (response.status === 429) return true;
  const message = data?.error?.message?.toLowerCase() ?? "";
  return message.includes("rate limit");
}

export async function postTipCheckout(
  { username, currency, amountCents = 50_000, supporterEmail },
  { retries = 4, idempotencyKey } = {},
) {
  const checkoutKey = idempotencyKey ?? createIdempotencyKey();

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const result = await apiRequest("POST", "/tips", {
      headers: { "Idempotency-Key": checkoutKey },
      body: {
        tip: {
          username,
          amount_cents: amountCents,
          currency,
          supporter_email: supporterEmail,
        },
      },
    });

    if (!isPaystackRateLimitResponse(result) || attempt === retries) {
      return result;
    }

    const waitMs = 15_000 * (attempt + 1);
    console.log(`   … Paystack rate limit, retrying tip checkout in ${waitMs / 1000}s`);
    await sleep(waitMs);
  }

  throw new Error("unreachable");
}

export async function fillSignupForm(page, { username, email, password, countryCode }) {
  await selectSignupMarket(page, countryCode);
  await page.fill("#username", username);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#password_confirmation", password);
}

export async function selectSignupMarket(page, countryCode) {
  const marketLabels = {
    KE: /Kenya \(KES\)/i,
    NG: /Nigeria \(NGN\)/i,
    GH: /Ghana \(GHS\)/i,
    ZA: /South Africa \(ZAR\)/i,
    CI: /Côte d'Ivoire \(XOF\)|Ivory Coast \(XOF\)/i,
  };

  const select = page.locator("#country_code");
  const hidden = page.locator('input[name="country_code"]');

  await Promise.race([
    select.waitFor({ state: "visible", timeout: 30_000 }),
    hidden.waitFor({ state: "attached", timeout: 30_000 }),
  ]).catch(() => {});

  if (!(await select.isVisible())) {
    if ((await hidden.count()) > 0) {
      const value = await hidden.inputValue();
      if (value !== countryCode) {
        throw new Error(`Expected signup market ${countryCode}, hidden input shows ${value}`);
      }
      return;
    }

    throw new Error(`Expected signup market ${countryCode}, but no market selector is visible`);
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await select.waitFor({ state: "visible" });

    try {
      await select.selectOption(countryCode);
    } catch {
      const label = marketLabels[countryCode];
      if (label) await select.selectOption({ label });
    }

    await select.evaluate((element, code) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        window.HTMLSelectElement.prototype,
        "value",
      );
      descriptor?.set?.call(element, code);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }, countryCode);

    const selected = await select.inputValue();
    if (selected === countryCode) return;

    await sleep(500);
  }

  const selected = await page.locator("#country_code").inputValue();
  throw new Error(`Expected signup market ${countryCode}, select shows ${selected}`);
}

export async function waitForServices() {
  const checks = [
    { name: "API", url: `${API_BASE}/up` },
    { name: "Web", url: `${WEB_BASE}/` },
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
