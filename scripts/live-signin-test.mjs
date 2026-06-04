import { chromium } from "playwright";
import {
  WEB_BASE,
  apiSignUp,
  assertNoStore,
  waitForServices,
} from "./live-helpers.mjs";

const ts = Date.now();
const username = `signin_${ts}`;
const email = `signin${ts}@tribetip.africa`;
const password = "securepass123";

await waitForServices();

const { response: signup } = await apiSignUp({ username, email, password });
if (!signup.ok) {
  throw new Error(`API signup failed: ${signup.status}`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("1. Open sign-in page");
  const signInPage = await page.goto(`${WEB_BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  assertNoStore(signInPage.headers(), "/sign-in");

  console.log("2. Sign in via UI with username");
  await page.fill("#login", username);
  await page.fill("#password", password);
  await page.getByRole("main").getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });

  const text = await page.textContent("main");
  if (!text?.includes(`@${username}`)) throw new Error("Dashboard missing username");

  console.log("PASS: live sign-in → dashboard");
} catch (error) {
  const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
  console.error("FAIL:", error.message);
  if (alert) console.error("Form error:", alert);
  process.exitCode = 1;
} finally {
  await browser.close();
}
