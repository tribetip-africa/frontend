import { chromium } from "playwright";

const ts = Date.now();
const username = `signin_${ts}`;
const email = `signin${ts}@tribetip.africa`;
const password = "securepass123";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  // Register via API so we only test sign-in UI
  const signup = await fetch("http://127.0.0.1:3001/tribes.json", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
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
  if (!signup.ok) throw new Error(`API signup failed: ${signup.status}`);

  await page.goto("http://localhost:3000/sign-in", { waitUntil: "networkidle" });
  await page.fill("#email", email);
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
