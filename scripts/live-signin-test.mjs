import { chromium } from "playwright";
import {
  WEB_BASE,
  completeOnboardingAfterSignup,
  apiSignUp,
  assertNoStore,
  paystackClientMode,
  waitForServices,
} from "./live-helpers.mjs";

const ts = Date.now();
const username = `signin_${ts}`;
const email = `signin${ts}@tribetip.africa`;
const password = "securepass123";

await waitForServices();
const mode = await paystackClientMode();
const countryCode = mode === "live" ? "KE" : "NG";

const { response: signup } = await apiSignUp({
  username,
  email,
  password,
  country_code: countryCode,
});
if (!signup.ok) {
  throw new Error(`API signup failed: ${signup.status}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(mode === "live" ? 60_000 : 30_000);

try {
  console.log("1. Open sign-in page");
  const signInPage = await page.goto(`${WEB_BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  assertNoStore(signInPage.headers(), "/sign-in");

  console.log("2. Sign in via UI with username");
  await page.fill("#login", username);
  await page.fill("#password", password);
  await page.getByRole("main").getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await completeOnboardingAfterSignup(page, { mode, countryCode });

  const text = await page.textContent("main");
  if (!text?.includes(`@${username}`)) throw new Error("Dashboard missing username");

  console.log("PASS: live sign-in → payout setup → dashboard");
} catch (error) {
  const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.error("FAIL:", error.message);
  if (alert) console.error("Form error:", alert);
  process.exitCode = 1;
} finally {
  await browser.close();
}
