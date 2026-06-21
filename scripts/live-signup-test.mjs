import { chromium } from "playwright";
import {
  WEB_BASE,
  fillSignupForm,
  completeOnboardingAfterSignup,
  assertDashboardShowsUsername,
  clickDashboardSignOut,
  waitForDashboardOnboardingClear,
  assertCspPresent,
  assertNoStore,
  paystackClientMode,
  waitForServices,
} from "./live-helpers.mjs";

const ts = Date.now();
const username = `live_${ts}`;
const email = `live${ts}@tribetip.africa`;
const password = "securepass123";

await waitForServices();
const mode = await paystackClientMode();
const countryCode = "KE";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(mode === "live" ? 120_000 : 30_000);

try {
  console.log("1. Open sign-up page");
  const signUpPage = await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  assertNoStore(signUpPage.headers(), "/sign-up");
  assertCspPresent(signUpPage.headers(), "/sign-up");
  await page.locator("h1", { hasText: "Start my page" }).waitFor();
  await page.locator("form").waitFor();
  await page.waitForSelector("#username", { state: "visible" });
  await page.waitForSelector("#email", { state: "visible" });

  console.log(`2. Fill and submit sign-up form (${countryCode})`);
  await fillSignupForm(page, { username, email, password, countryCode });
  await page.getByRole("main").getByRole("button", { name: /start my page/i }).click();

  console.log(
    mode === "live"
      ? "3. Complete payout setup and reach dashboard (live Paystack)"
      : "3. Complete payout setup and reach dashboard (stub Paystack)",
  );
  await page.waitForURL((url) => new URL(url).pathname === "/dashboard", { timeout: 30000 });
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 30_000 });

  await completeOnboardingAfterSignup(page, { mode, countryCode });
  await waitForDashboardOnboardingClear(page, { mode, countryCode, username });

  const dashboardResponse = await page.reload({ waitUntil: "domcontentloaded" });
  assertNoStore(dashboardResponse.headers(), "/dashboard");

  await waitForDashboardOnboardingClear(page, { mode, countryCode, username });
  await assertDashboardShowsUsername(page, username);

  console.log("4. Sign out");
  await clickDashboardSignOut(page);
  await page.waitForURL("**/", { timeout: 10000 });

  console.log("PASS: live sign-up → payout setup → dashboard → sign-out");
} catch (error) {
  const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.error("FAIL:", error.message);
  if (alert) console.error("Form error:", alert);
  process.exitCode = 1;
} finally {
  await browser.close();
}
