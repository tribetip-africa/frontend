import { chromium } from "playwright";
import {
  WEB_BASE,
  apiRequest,
  assertStructuredError,
  waitForServices,
} from "./live-helpers.mjs";

await waitForServices();

console.log("1. API validation errors use structured payload");
const validation = await apiRequest("POST", "/tribes.json", {
  body: {
    tribe: {
      email: "invalid-email",
      password: "securepass123",
      password_confirmation: "securepass123",
      username: "ab",
      country_code: "NG",
      currency: "NGN",
    },
  },
});
if (validation.response.status !== 422) {
  throw new Error(`Expected validation 422, got ${validation.response.status}`);
}
assertStructuredError(validation.data, { code: "validation_failed" });
if (!Array.isArray(validation.data.errors) || validation.data.errors.length === 0) {
  throw new Error("Expected legacy errors array for validation responses");
}

console.log("1b. API rejects reserved usernames");
const reservedTs = Date.now();
const reserved = await apiRequest("POST", "/tribes.json", {
  body: {
    tribe: {
      email: `reserved_${reservedTs}@tribetip.africa`,
      password: "securepass123",
      password_confirmation: "securepass123",
      username: "faq",
      country_code: "KE",
      currency: "KES",
    },
  },
});
if (reserved.response.status !== 422) {
  throw new Error(`Expected reserved username 422, got ${reserved.response.status}`);
}
assertStructuredError(reserved.data, { code: "validation_failed" });
const reservedMessages = (reserved.data.errors ?? []).join(" ").toLowerCase();
if (!reservedMessages.includes("reserved")) {
  throw new Error(`Expected reserved username error, got: ${JSON.stringify(reserved.data.errors)}`);
}

console.log("1c. API rejects passwords shorter than 8 characters");
const shortPassword = await apiRequest("POST", "/tribes.json", {
  body: {
    tribe: {
      email: `shortpw_${reservedTs}@tribetip.africa`,
      password: "1234567",
      password_confirmation: "1234567",
      username: `shortpw_${reservedTs}`,
      country_code: "KE",
      currency: "KES",
    },
  },
});
if (shortPassword.response.status !== 422) {
  throw new Error(`Expected short password 422, got ${shortPassword.response.status}`);
}
assertStructuredError(shortPassword.data, { code: "validation_failed" });

console.log("2. API not found errors use structured payload");
const missing = await apiRequest("GET", "/tribes/missing_live_errors_user", {
  headers: { Accept: "application/json" },
});
if (missing.response.status !== 404) {
  throw new Error(`Expected not found 404, got ${missing.response.status}`);
}
assertStructuredError(missing.data, { code: "not_found" });

console.log("3. API authentication errors use structured payload");
const signOut = await apiRequest("DELETE", "/tribes/sign_out.json");
if (signOut.response.status !== 401) {
  throw new Error(`Expected sign-out 401, got ${signOut.response.status}`);
}
assertStructuredError(signOut.data, { code: "authentication_failed" });
if (signOut.data.error.message !== "No active session.") {
  throw new Error(`Unexpected auth message: ${signOut.data.error.message}`);
}

console.log("4. Sign-up UI surfaces structured validation errors");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const uiTs = Date.now();

try {
  await page.goto(`${WEB_BASE}/sign-up`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#username", { state: "visible" });
  const countrySelect = page.locator("#country_code");
  if (await countrySelect.isVisible()) {
    await countrySelect.selectOption("KE");
  }
  await page.fill("#username", "ab");
  await page.fill("#email", `errors_ui_${uiTs}@tribetip.africa`);
  await page.fill("#password", "securepass123");
  await page.fill("#password_confirmation", "securepass123");
  await page.getByRole("main").getByRole("button", { name: /start my page/i }).click();

  const alert = page.locator('[role="alert"]');
  await alert.filter({ hasText: /validation failed/i }).waitFor({
    state: "visible",
    timeout: 15000,
  });
} finally {
  await browser.close();
}

console.log("5. API rate limit errors use structured payload");
let rateLimited = null;
for (let attempt = 1; attempt <= 12; attempt++) {
  const { response, data } = await apiRequest("POST", "/tribes/sign_in.json", {
    body: { tribe: { login: "nobody@tribetip.africa", password: "wrong-password" } },
  });
  if (response.status === 429) {
    rateLimited = { response, data };
    break;
  }
}
if (!rateLimited) {
  throw new Error("Expected rate limit 429 after repeated sign-in attempts");
}
assertStructuredError(rateLimited.data, { code: "rate_limited" });

console.log("PASS: live structured error handling");
