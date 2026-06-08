import { chromium } from "playwright";
import {
  WEB_BASE,
  fillSignupForm,
  completeOnboardingAfterSignup,
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
const countryCode = mode === "live" ? "KE" : "NG";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(mode === "live" ? 60_000 : 30_000);

try {
  console.log("1. Open sign-up page");
  const signUpPage = await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  assertNoStore(signUpPage.headers(), "/sign-up");
  assertCspPresent(signUpPage.headers(), "/sign-up");
  await page.locator("h1", { hasText: "Create your creator page" }).waitFor();
  await page.locator("form").waitFor();
  await page.waitForSelector("#username", { state: "visible" });
  await page.waitForSelector("#email", { state: "visible" });

  console.log(`2. Fill and submit sign-up form (${countryCode})`);
  await fillSignupForm(page, { username, email, password, countryCode });
  await page.getByRole("button", { name: /create my page/i }).click();

  console.log(
    mode === "live"
      ? "3. Complete payout setup and reach dashboard (live Paystack)"
      : "3. Complete payout setup and reach dashboard (stub Paystack)",
  );
  await page.waitForURL((url) => new URL(url).pathname === "/dashboard", { timeout: 30000 });

  await completeOnboardingAfterSignup(page, { mode, countryCode });

  const dashboardResponse = await page.reload({ waitUntil: "domcontentloaded" });
  assertNoStore(dashboardResponse.headers(), "/dashboard");

  const dashboardText = await page.textContent("main");
  if (!dashboardText?.includes(`@${username}`)) {
    throw new Error(`Dashboard missing @${username}`);
  }

  console.log("4. Sign out");
  await page.getByRole("main").getByRole("button", { name: /sign out/i }).click();
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
