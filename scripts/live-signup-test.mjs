import { chromium } from "playwright";
import {
  WEB_BASE,
  assertCspPresent,
  assertNoStore,
  waitForServices,
} from "./live-helpers.mjs";

const ts = Date.now();
const username = `live_${ts}`;
const email = `live${ts}@tribetip.africa`;
const password = "securepass123";

await waitForServices();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("1. Open sign-up page");
  const signUpPage = await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "networkidle" });
  assertNoStore(signUpPage.headers(), "/sign-up");
  assertCspPresent(signUpPage.headers(), "/sign-up");
  await page.getByRole("heading", { name: /create your creator page/i }).waitFor();

  console.log("2. Fill and submit sign-up form");
  await page.selectOption("#country_code", "NG");
  await page.fill("#username", username);
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.fill("#password_confirmation", password);
  await page.getByRole("button", { name: /create my page/i }).click();

  console.log("3. Wait for dashboard (dev skips email confirmation)");
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  const dashboardResponse = await page.reload({ waitUntil: "domcontentloaded" });
  assertNoStore(dashboardResponse.headers(), "/dashboard");

  const dashboardText = await page.textContent("main");
  if (!dashboardText?.includes(`@${username}`)) {
    throw new Error(`Dashboard missing @${username}`);
  }

  console.log("4. Sign out");
  await page.getByRole("main").getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("**/", { timeout: 10000 });

  console.log("PASS: live sign-up → dashboard → sign-out");
} catch (error) {
  const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.error("FAIL:", error.message);
  if (alert) console.error("Form error:", alert);
  process.exitCode = 1;
} finally {
  await browser.close();
}
