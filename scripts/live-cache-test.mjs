import { chromium } from "playwright";
import {
  API_BASE,
  WEB_BASE,
  apiSignUp,
  assertCspPresent,
  assertNoStore,
  assertPublicShort,
  enablePublicProfile,
  waitForServices,
} from "./live-helpers.mjs";

await waitForServices();

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  console.log("1. Auth pages use no-store (proxy)");
  for (const path of ["/sign-up", "/sign-in", "/dashboard"]) {
    const response = await page.goto(`${WEB_BASE}${path}`, {
      waitUntil: "domcontentloaded",
    });
    assertNoStore(response.headers(), path);
  }

  console.log("2. Landing page uses static cache policy + CSP");
  const home = await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded" });
  const homePolicy = home.headers()["x-cache-policy"];
  if (homePolicy !== "staticPage") {
    throw new Error(`Expected staticPage policy on /, got: ${homePolicy}`);
  }
  assertCspPresent(home.headers(), "/");

  console.log("3. API auth responses use no-store");
  const { response: signUp } = await apiSignUp({
    username: `cache_${Date.now()}`,
    email: `cache${Date.now()}@tribetip.africa`,
  });
  assertNoStore(Object.fromEntries(signUp.headers.entries()), "POST /tribes.json");

  console.log("4. Public profile API uses public cache when published");
  const ts = Date.now();
  const username = `public_${ts}`;
  const { response: register } = await apiSignUp({
    username,
    email: `public${ts}@tribetip.africa`,
  });
  if (!register.ok) throw new Error(`Sign-up failed: ${register.status}`);

  await enablePublicProfile(username);

  const profile = await fetch(`${API_BASE}/tribes/${username}`, {
    headers: { Accept: "application/json", Origin: WEB_BASE },
  });

  if (profile.status !== 200) {
    throw new Error(`Expected public profile 200, got ${profile.status}`);
  }

  const body = await profile.json();
  if (!body.profile?.username) {
    throw new Error("Profile payload missing username");
  }
  if (body.profile.email) {
    throw new Error("Profile payload must not include email");
  }

  assertPublicShort(Object.fromEntries(profile.headers.entries()), `GET /tribes/${username}`);

  console.log("5. Authenticated profile read uses no-store");
  const authed = await fetch(`${API_BASE}/tribes/${username}`, {
    headers: {
      Accept: "application/json",
      Origin: WEB_BASE,
      Authorization: "Bearer fake.token",
    },
  });
  assertNoStore(Object.fromEntries(authed.headers.entries()), "GET /tribes/:username (auth)");

  console.log("PASS: live cache security checks");
} catch (error) {
  console.error("FAIL:", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
