import { chromium } from "playwright";
import {
  WEB_BASE,
  PAYSTACK_REGIONS,
  apiPublishProfile,
  apiRequest,
  apiSignIn,
  apiSignUp,
  assertNoStore,
  assertPaystackAccounts,
  assertPaystackOnboarding,
  assertRealPaystackCode,
  assertRegionMarket,
  assertStructuredError,
  auditPaystackOnboarding,
  completeOnboardingFromPayload,
  clearPaystackOnboarding,
  enablePublicProfile,
  fetchLatestTip,
  fetchPaystackAccounts,
  paystackClientMode,
  pickSettlementBank,
  postTipCheckout,
  regionUsername,
  selectSignupMarket,
  waitForServices,
} from "./live-helpers.mjs";

const KE = PAYSTACK_REGIONS.find((region) => region.code === "KE");
const password = "securepass123";
const results = [];

function record(step, status, detail = "") {
  results.push({ step, status, detail });
}

await waitForServices();

const mode = await paystackClientMode();
console.log(`Paystack client mode: ${mode}`);
if (mode !== "live") {
  console.error("FAIL: expected live Paystack mode (set PAYSTACK_SECRET_KEY in tribetip/.env)");
  process.exit(1);
}

console.log("\n=== Kenya (KE) end-to-end — all scenarios ===\n");

// 1. Signup
const username = regionUsername("ke_e2e", "KE");
const email = `${username}@tribetip.africa`;

try {
  const { data: signupData } = await apiSignUp({
    username,
    email,
    password,
    country_code: "KE",
  });
  assertRegionMarket(signupData, KE);
  assertPaystackOnboarding(signupData, { complete: false });
  record("signup", "ok", username);

  let accounts = await fetchPaystackAccounts(username);
  assertPaystackAccounts(accounts, KE, { customer: true, subaccount: false });
  assertRealPaystackCode(accounts.customerCode, { label: "customer" });
  record("customer_provisioned", "ok", accounts.customerCode);
} catch (error) {
  record("signup", "failed", error.message);
  console.error(`✗ signup: ${error.message}`);
  printSummary();
  process.exit(1);
}

const { token } = await apiSignIn({ login: username, password });

// 2. Guards before onboarding
try {
  const profile = await apiRequest("GET", "/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (profile.response.status !== 403) {
    throw new Error(`expected profile 403, got ${profile.response.status}`);
  }
  assertStructuredError(profile.data, { code: "onboarding_required" });
  record("profile_guard", "ok");

  const publishBlocked = await apiPublishProfile(token);
  if (publishBlocked.response.status !== 403) {
    throw new Error(`expected publish 403, got ${publishBlocked.response.status}`);
  }
  record("publish_guard", "ok");

  await enablePublicProfile(username);
  const tipBlocked = await postTipCheckout({
    username,
    currency: "KES",
    supporterEmail: `blocked_${Date.now()}@tribetip.africa`,
  });
  if (tipBlocked.response.status !== 404) {
    throw new Error(`expected tip 404, got ${tipBlocked.response.status}`);
  }
  assertStructuredError(tipBlocked.data, { code: "not_found" });
  record("tips_guard", "ok");
} catch (error) {
  record("guards", "failed", error.message);
  console.error(`✗ guards: ${error.message}`);
  printSummary();
  process.exit(1);
}

// 3. Onboarding — real Kenyan banks
let onboardingPayload;
try {
  const status = await apiRequest("GET", "/me/paystack/onboarding", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (status.response.status !== 200) {
    throw new Error(`onboarding status ${status.response.status}`);
  }
  onboardingPayload = status.data;
  assertRegionMarket(onboardingPayload, KE);
  if ((onboardingPayload.banks ?? []).length < 2) {
    throw new Error(`expected multiple KE banks, got ${onboardingPayload.banks?.length ?? 0}`);
  }
  const bank = pickSettlementBank(onboardingPayload.banks, { preferName: "KCB" });
  record("banks_list", "ok", `${onboardingPayload.banks.length} banks (using ${bank.name})`);

  const linked = await completeOnboardingFromPayload(token, onboardingPayload, "KE");
  if (linked.response.status !== 200) {
    throw new Error(`onboarding link failed: ${JSON.stringify(linked.data)}`);
  }
  assertPaystackOnboarding(linked.data, { complete: true });
  record("onboarding_link", "ok", bank.code);

  const accounts = await fetchPaystackAccounts(username);
  assertPaystackAccounts(accounts, KE, { customer: true, subaccount: true, complete: true });
  assertRealPaystackCode(accounts.subaccountCode, { label: "subaccount" });
  record("subaccount_provisioned", "ok", accounts.subaccountCode);

  const audit = await auditPaystackOnboarding(username, { sync: true });
  if (!audit.healthy) {
    throw new Error(`audit unhealthy: ${JSON.stringify(audit.checks)}`);
  }
  record("paystack_audit", "ok");
} catch (error) {
  record("onboarding", "failed", error.message);
  console.error(`✗ onboarding: ${error.message}`);
  printSummary();
  process.exit(1);
}

// 4. Dashboard + publish
try {
  const profile = await apiRequest("GET", "/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (profile.response.status !== 200) {
    throw new Error(`profile ${profile.response.status}`);
  }
  if (profile.data.profile?.account_status !== "active") {
    throw new Error(`expected active account, got ${profile.data.profile?.account_status}`);
  }
  record("dashboard_profile", "ok");

  await apiRequest("PATCH", "/me/profile", {
    headers: { Authorization: `Bearer ${token}` },
    body: { profile: { display_name: "KE E2E Creator", bio: "Live Paystack test" } },
  });

  const published = await apiPublishProfile(token);
  if (published.response.status !== 200) {
    throw new Error(`publish failed: ${JSON.stringify(published.data)}`);
  }
  if (!published.data.profile?.is_profile_public) {
    throw new Error("profile not public after publish");
  }
  record("publish", "ok");

  const publicProfile = await apiRequest("GET", `/tribes/${username}`);
  if (publicProfile.response.status !== 200) {
    throw new Error(`public profile ${publicProfile.response.status}`);
  }
  if (publicProfile.data.profile?.currency !== "KES") {
    throw new Error(`expected KES public profile, got ${publicProfile.data.profile?.currency}`);
  }
  record("public_profile", "ok");
} catch (error) {
  record("publish_flow", "failed", error.message);
  console.error(`✗ publish: ${error.message}`);
  printSummary();
  process.exit(1);
}

// 5. Real Paystack tip checkout
try {
  const checkout = await postTipCheckout({
    username,
    currency: "KES",
    amountCents: 50_000,
    supporterEmail: `fan_ke_${Date.now()}@tribetip.africa`,
  });
  if (checkout.response.status !== 201) {
    throw new Error(`checkout ${checkout.response.status}: ${JSON.stringify(checkout.data)}`);
  }
  const url = checkout.data.tip?.authorization_url;
  if (!url?.includes("checkout.paystack.com")) {
    throw new Error(`expected Paystack checkout URL, got ${url}`);
  }
  if (checkout.data.tip.currency !== "KES") {
    throw new Error(`expected KES tip, got ${checkout.data.tip.currency}`);
  }

  const storedTip = await fetchLatestTip(username);
  if (!storedTip || storedTip.currency !== "KES" || storedTip.status !== "pending") {
    throw new Error(`unexpected stored tip: ${JSON.stringify(storedTip)}`);
  }
  record("tip_checkout", "ok", url);
  console.log(`\n   Paystack checkout: ${url}`);
} catch (error) {
  record("tip_checkout", "failed", error.message);
  console.error(`✗ tip checkout: ${error.message}`);
  printSummary();
  process.exit(1);
}

// 6. Tips blocked without onboarding (separate user)
try {
  const blockedUser = regionUsername("ke_blocked", "KE");
  await apiSignUp({
    username: blockedUser,
    email: `${blockedUser}@tribetip.africa`,
    password,
    country_code: "KE",
  });
  await clearPaystackOnboarding(blockedUser);
  await enablePublicProfile(blockedUser);

  const blocked = await postTipCheckout({
    username: blockedUser,
    currency: "KES",
    supporterEmail: `blocked2_${Date.now()}@tribetip.africa`,
  });
  if (blocked.response.status !== 404) {
    throw new Error(`expected 404, got ${blocked.response.status}`);
  }
  record("tips_blocked_no_onboarding", "ok");
} catch (error) {
  record("tips_blocked_no_onboarding", "failed", error.message);
  console.error(`✗ tips blocked: ${error.message}`);
  printSummary();
  process.exit(1);
}

// 7. UI flow — signup → onboarding → dashboard
console.log("\n7. UI flow (Kenya)");
const uiUser = regionUsername("ke_ui", "KE");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  await selectSignupMarket(page, "KE");
  await page.fill("#username", uiUser);
  await page.fill("#email", `${uiUser}@tribetip.africa`);
  await page.fill("#password", password);
  await page.fill("#password_confirmation", password);
  await page.getByRole("button", { name: /create my page/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await page.getByRole("dialog").getByRole("heading", { name: /set up payouts/i }).waitFor();

  const dashboardPage = await page.reload({ waitUntil: "domcontentloaded" });
  assertNoStore(dashboardPage.headers(), "/dashboard");
  await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 45000 });
  await page.locator("#settlement_bank").waitFor({ timeout: 45000 });
  const bankOptions = await page.locator("#settlement_bank option").count();
  if (bankOptions < 2) {
    throw new Error(`expected multiple settlement banks, got ${bankOptions}`);
  }
  await page.locator("#account_number").waitFor();
  await page.fill("#account_number", "0000000000");
  await page.getByRole("button", { name: /link payout account/i }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 30000 });
  record("ui_onboarding", "ok");
} catch (error) {
  record("ui_onboarding", "failed", error.message);
  console.error(`✗ UI flow: ${error.message}`);
  await browser.close();
  printSummary();
  process.exit(1);
} finally {
  await browser.close();
}

printSummary();
console.log("\nPASS: Kenya live Paystack end-to-end (all scenarios)");

function printSummary() {
  console.log("\n--- KE E2E summary ---");
  console.log("Step | Status | Detail");
  for (const entry of results) {
    console.log(`${entry.step.padEnd(28)} | ${entry.status.padEnd(6)} | ${entry.detail}`);
  }
  const failed = results.filter((entry) => entry.status === "failed");
  if (failed.length > 0) {
    console.error("\nFailed:", failed.map((entry) => entry.step).join(", "));
  }
}
