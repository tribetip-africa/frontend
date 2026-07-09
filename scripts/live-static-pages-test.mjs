import { chromium } from "playwright";
import {
  WEB_BASE,
  assertNoStore,
  isLiveSignupOpen,
  liveLaunchMode,
  waitForServices,
} from "./live-helpers.mjs";

function assertLockedCsp(headers, route) {
  const csp =
    headers["content-security-policy"] ??
    headers.get?.("content-security-policy");
  if (!csp) {
    throw new Error(`${route} expected CSP header, got none`);
  }
  if (!csp.includes("frame-ancestors 'none'")) {
    throw new Error(`${route} expected frame-ancestors 'none', got: ${csp}`);
  }
  if (csp.includes("frame-ancestors *")) {
    throw new Error(`${route} must not use embeddable frame-ancestors *`);
  }
}

const STATIC_PAGES = [
  { path: "/faq", heading: /frequently asked questions/i, label: "FAQ" },
  { path: "/terms", heading: /terms of service/i, label: "Terms" },
  { path: "/privacy", heading: /privacy policy/i, label: "Privacy" },
];

await waitForServices();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("1. Static legal/help pages load with locked CSP");
  for (const { path, heading, label } of STATIC_PAGES) {
    const response = await page.goto(`${WEB_BASE}${path}`, { waitUntil: "domcontentloaded" });
    if (!response?.ok()) {
      throw new Error(`${label} page returned ${response?.status()}`);
    }
    assertLockedCsp(response.headers(), path);
    await page.locator("h1", { hasText: heading }).waitFor({ state: "visible", timeout: 15_000 });
    console.log(`   ✓ ${label} (${path})`);
  }

  console.log("2. Footer links reach FAQ, Terms, and Privacy");
  await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded" });
  const footer = page.getByRole("contentinfo");
  await footer.getByRole("link", { name: /^faq$/i }).click();
  await page.waitForURL("**/faq", { timeout: 10_000 });
  await footer.getByRole("link", { name: /terms of service/i }).click();
  await page.waitForURL("**/terms", { timeout: 10_000 });
  await footer.getByRole("link", { name: /privacy policy/i }).click();
  await page.waitForURL("**/privacy", { timeout: 10_000 });

  console.log("3. Header FAQ link works from landing page");
  await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation").getByRole("link", { name: /^faq$/i }).click();
  await page.waitForURL("**/faq", { timeout: 10_000 });
  await page.locator("h1", { hasText: /frequently asked questions/i }).waitFor();

  console.log("4. FAQ category navigation is present");
  await page.getByRole("link", { name: /^getting started$/i }).waitFor({ state: "visible" });
  await page.getByRole("link", { name: /^payments & fees$/i }).waitFor({ state: "visible" });

  console.log("5. Terms and Privacy cross-link to each other");
  await page.goto(`${WEB_BASE}/terms`, { waitUntil: "domcontentloaded" });
  await page.getByRole("main").getByRole("link", { name: /^faq$/i }).click();
  await page.waitForURL("**/faq", { timeout: 10_000 });

  await page.goto(`${WEB_BASE}/privacy`, { waitUntil: "domcontentloaded" });
  await page.getByRole("main").getByRole("link", { name: /terms of service/i }).click();
  await page.waitForURL("**/terms", { timeout: 10_000 });

  console.log("6. Auth pages remain no-store (regression)");
  if (isLiveSignupOpen()) {
    for (const path of ["/sign-in", "/sign-up"]) {
      const response = await page.goto(`${WEB_BASE}${path}`, { waitUntil: "domcontentloaded" });
      assertNoStore(response.headers(), path);
    }
  } else {
    console.log(`   … launch mode is ${liveLaunchMode()}, checking waitlist gating instead`);
    for (const path of ["/sign-in", "/sign-up"]) {
      await page.goto(`${WEB_BASE}${path}`, { waitUntil: "domcontentloaded" });
      await page.waitForURL("**/waitlist", { timeout: 10_000 });
    }
    const waitlistResponse = await page.goto(`${WEB_BASE}/waitlist`, {
      waitUntil: "domcontentloaded",
    });
    assertNoStore(waitlistResponse.headers(), "/waitlist");
  }

  console.log("PASS: static pages and navigation");
} catch (error) {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
