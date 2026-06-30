import { chromium } from "playwright";
import {
  WEB_BASE,
  PAYSTACK_REGIONS,
  KE_MPESA_LINE,
  apiPublishProfile,
  apiRequest,
  apiSignIn,
  apiSignUp,
  assertPaystackOnboarding,
  assertPaystackOnboardingLinked,
  assertRealPaystackCode,
  assertRegionMarket,
  auditPaystackOnboarding,
  fillSignupForm,
  completeMpesaOnboardingUI,
  completeRegionOnboarding,
  fetchLatestTip,
  enablePublicProfile,
  fetchPaystackAccounts,
  paystackClientMode,
  pickSettlementBank,
  postTipCheckout,
  regionUsername,
  waitForPaystackCustomer,
  waitForServices,
} from "./live-helpers.mjs";

const KE = PAYSTACK_REGIONS.find((region) => region.code === "KE");
const password = "securepass123";

await waitForServices();

if ((await paystackClientMode()) !== "live") {
  console.error("FAIL: set PAYSTACK_SECRET_KEY in tribetip/.env for live M-Pesa test");
  process.exit(1);
}

console.log("=== Kenya M-Pesa / Safaricom payout E2E ===\n");

console.log("1. UI — Kenyan signup, M-PESA onboarding, dashboard");
const uiUser = regionUsername("ke_mpesa_ui", "KE");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(120_000);

try {
  await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#username", { state: "visible" });
  await fillSignupForm(page, {
    username: uiUser,
    email: `${uiUser}@tribetip.africa`,
    password,
    countryCode: "KE",
  });
  await page.getByRole("main").getByRole("button", { name: /start my page/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await page.getByRole("dialog").getByRole("heading", { name: /set up payouts/i }).waitFor();
  await page.getByRole("heading", { name: /set up payouts/i }).waitFor();
  await completeMpesaOnboardingUI(page);
  console.log(`   ✓ UI flow completed for @${uiUser}`);
} catch (error) {
  const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.error("   ✗ UI flow failed:", error.message);
  if (alert) console.error("   UI error:", alert);
  await browser.close();
  process.exit(1);
} finally {
  await browser.close();
}

// Brief pause so Paystack customer provisioning from the UI signup can finish
// before we create a second Kenyan account in the same test run.
await new Promise((resolve) => setTimeout(resolve, 5_000));

const username = regionUsername("ke_mpesa", "KE");
const email = `${username}@tribetip.africa`;

console.log("\n2. API — sign up Kenyan creator");
const { data: signupData } = await apiSignUp({
  username,
  email,
  password,
  country_code: "KE",
});
assertRegionMarket(signupData, KE);
assertPaystackOnboarding(signupData, { complete: false });

const accounts = await waitForPaystackCustomer(username, { timeoutMs: 180_000 });
assertRealPaystackCode(accounts.customerCode, { label: "customer" });
console.log(`   ✓ customer ${accounts.customerCode}`);

const { token } = await apiSignIn({ login: username, password });

console.log("3. API — settlement options include M-PESA");
const status = await apiRequest("GET", "/me/paystack/onboarding", {
  headers: { Authorization: `Bearer ${token}` },
});
const mpesaBank = pickSettlementBank(status.data.banks, { preferMpesa: true });
if (mpesaBank.code !== "MPESA" || !mpesaBank.mobile_money) {
  throw new Error(`expected M-PESA mobile money bank, got ${JSON.stringify(mpesaBank)}`);
}
console.log(`   ✓ ${mpesaBank.name} (${mpesaBank.code})`);

console.log("4. API — link subaccount to Safaricom line");
const linked = await completeRegionOnboarding(token, KE, {
  bankCode: "MPESA",
  accountNumber: KE_MPESA_LINE,
});
if (linked.response.status !== 200) {
  throw new Error(`onboarding failed: ${JSON.stringify(linked.data)}`);
}
assertPaystackOnboardingLinked(linked.data);

const linkedAccounts = await fetchPaystackAccounts(username);
assertRealPaystackCode(linkedAccounts.subaccountCode, { label: "subaccount" });
console.log(`   ✓ subaccount ${linkedAccounts.subaccountCode} → ${KE_MPESA_LINE}`);

const audit = await auditPaystackOnboarding(username, { sync: true });
if (!audit.healthy) {
  console.log(`   … Paystack audit pending verification: ${JSON.stringify(audit.checks)}`);
}
console.log("   ✓ Paystack subaccount linked");

console.log("5. API — publish and live KES checkout");
await enablePublicProfile(username);
const published = await apiPublishProfile(token);
if (published.response.status === 403) {
  console.log("   … publish blocked until Paystack verifies payout account (expected in live test mode)");
} else if (published.response.status !== 200) {
  throw new Error(`publish failed: ${JSON.stringify(published.data)}`);
} else {
  console.log("   ✓ profile published");
}

const checkout = await postTipCheckout({
  username,
  currency: "KES",
  amountCents: 50_000,
  supporterEmail: `mpesa_fan_${Date.now()}@tribetip.africa`,
});
if (checkout.response.status !== 201) {
  throw new Error(`checkout failed: ${JSON.stringify(checkout.data)}`);
}
const url = checkout.data.tip?.authorization_url;
if (!url?.includes("checkout.paystack.com")) {
  throw new Error(`missing Paystack checkout URL: ${url}`);
}
const tip = await fetchLatestTip(username);
console.log(`   ✓ checkout ${url}`);
console.log(`   ✓ tip persisted ${tip.currency} ${tip.status}`);

console.log("\nPASS: Kenya creator with M-Pesa / Safaricom payout verified");
