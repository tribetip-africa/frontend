import { chromium } from "playwright";
import {
  WEB_BASE,
  completeMpesaOnboardingUI,
  completeOnboardingFromPayload,
  completeStubOnboardingUI,
  paystackClientMode,
  pickSettlementBank,
  enabledPaystackRegions,
  regionsForLiveTests,
  apiRequest,
  apiSignIn,
  apiSignUp,
  assertNoStore,
  assertPaystackAccounts,
  assertPaystackOnboarding,
  assertPaystackOnboardingLinked,
  assertRegionMarket,
  assertStructuredError,
  clearPaystackSubaccount,
  completeRegionOnboarding,
  enablePublicProfile,
  fetchPaystackAccounts,
  regionUsername,
  waitForPaystackCustomer,
  waitForPaystackSubaccountLinked,
  waitForServices,
} from "./live-helpers.mjs";

const password = "securepass123";
const results = [];

await waitForServices();

const mode = await paystackClientMode();
const regions = await regionsForLiveTests();
const enabledPaystackRegionsList = await enabledPaystackRegions();

console.log(`1. Full account flow for regions (API) [${mode}]`);
console.log(`   Regions: ${regions.map((region) => region.code).join(", ")}`);

for (const region of regions) {
  const username = regionUsername("region", region.code);
  const email = `${username}@tribetip.africa`;
  const record = { region: region.code, steps: {}, passed: false };

  try {
    const { data: signupData } = await apiSignUp({
      username,
      email,
      password,
      country_code: region.code,
    });
    record.steps.signup = "ok";
    assertRegionMarket(signupData, region);

    let accounts = await fetchPaystackAccounts(username);
    if (mode === "live") {
      assertPaystackAccounts(accounts, region, { customer: false, subaccount: false });
      record.steps.customer = accounts.customerCode ? "ok" : "pending";
    } else {
      accounts = await waitForPaystackCustomer(username);
      assertPaystackAccounts(accounts, region, { customer: true, subaccount: false });
      record.steps.customer = accounts.customerCode ? "ok" : "missing";
    }

    if (region.subaccountSupported) {
      assertPaystackOnboarding(signupData, { complete: false });
      record.steps.stubSubaccount =
        mode === "live" ? "pending" : accounts.subaccountCode ? "ok" : "missing";

      await clearPaystackSubaccount(username);
      const { token } = await apiSignIn({ login: username, password });

      const status = await apiRequest("GET", "/me/paystack/onboarding", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status.response.status !== 200) {
        throw new Error(`onboarding status ${status.response.status}`);
      }
      assertRegionMarket(status.data, region);
      const banks = status.data.banks ?? [];
      if (banks.length === 0) {
        throw new Error("expected settlement banks");
      }
      if (mode === "live" && region.code === "KE") {
        const mpesa = pickSettlementBank(banks, { preferMpesa: true });
        if (mpesa.code !== "MPESA") {
          throw new Error(`expected M-PESA in live bank list, got ${mpesa.code}`);
        }
      }
      record.steps.banks = "ok";

      const linked =
        mode === "live" && region.code === "KE"
          ? await completeOnboardingFromPayload(token, status.data, "KE", { preferMpesa: true })
          : await completeRegionOnboarding(token, region);
      if (linked.response.status !== 200) {
        throw new Error(`onboarding link failed: ${JSON.stringify(linked.data)}`);
      }
      if (mode === "live") {
        assertPaystackOnboardingLinked(linked.data);
      } else {
        assertPaystackOnboarding(linked.data, { complete: true });
      }
      record.steps.onboarding = "ok";

      if (mode === "live") {
        accounts = await waitForPaystackSubaccountLinked(username);
      } else {
        accounts = await fetchPaystackAccounts(username);
      }
      assertPaystackAccounts(accounts, region, {
        customer: true,
        subaccount: true,
        complete: mode !== "live",
      });
      record.steps.subaccount = accounts.subaccountCode ? "ok" : "missing";

      const profile = await apiRequest("GET", "/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profile.response.status !== 200) {
        throw new Error(`profile access ${profile.response.status}`);
      }
      record.steps.dashboard = "ok";

      await enablePublicProfile(username);
      if (mode === "live") {
        record.steps.tips = "n/a (live-tips-test)";
      } else {
        const checkout = await apiRequest("POST", "/tips", {
          body: {
            tip: {
              username,
              amount_cents: 50_000,
              currency: region.currency,
              supporter_email: `fan_${region.code.toLowerCase()}@tribetip.africa`,
            },
          },
        });
        if (checkout.response.status !== 201) {
          throw new Error(`tip checkout ${checkout.response.status}: ${JSON.stringify(checkout.data)}`);
        }
        if (!checkout.data.tip?.authorization_url) {
          throw new Error("missing authorization_url");
        }
        record.steps.tips = "ok";
      }
    } else {
      assertPaystackOnboarding(signupData, { complete: false });
      record.steps.stubSubaccount = "n/a";

      const { token } = await apiSignIn({ login: username, password });
      const status = await apiRequest("GET", "/me/paystack/onboarding", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if ((status.data.banks ?? []).length !== 0) {
        throw new Error("expected no banks");
      }
      record.steps.banks = "blocked";

      const blocked = await completeRegionOnboarding(token, region);
      if (blocked.response.status !== 400) {
        throw new Error(`expected blocked onboarding 400, got ${blocked.response.status}`);
      }
      assertStructuredError(blocked.data, { code: "bad_request" });
      record.steps.onboarding = "blocked";

      const profile = await apiRequest("GET", "/me/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profile.response.status !== 403) {
        throw new Error(`expected onboarding guard 403, got ${profile.response.status}`);
      }
      record.steps.dashboard = "blocked";
      record.steps.tips = "n/a";
    }

    record.passed = true;
    console.log(`   ✓ ${region.code} full flow passed`);
  } catch (error) {
    record.error = error.message;
    console.error(`   ✗ ${region.code} failed: ${error.message}`);
  }

  results.push(record);
}

console.log("\n2. Region summary");
console.log("Region | Signup | Customer | Subaccount | Onboarding | Dashboard | Tips");
for (const result of results) {
  console.log(
    [
      result.region.padEnd(6),
      result.steps.signup ?? "-",
      result.steps.customer ?? "-",
      result.steps.subaccount ?? result.steps.stubSubaccount ?? "-",
      result.steps.onboarding ?? "-",
      result.steps.dashboard ?? "-",
      result.steps.tips ?? "-",
    ].join(" | "),
  );
}

const failedSupported = results.filter(
  (result) => regions.find((r) => r.code === result.region)?.subaccountSupported && !result.passed,
);
const failedUnsupported = results.filter(
  (result) => !regions.find((r) => r.code === result.region)?.subaccountSupported && !result.passed,
);

if (failedSupported.length > 0) {
  console.error("\nFAIL: supported regions did not pass:", failedSupported.map((r) => r.region).join(", "));
  process.exit(1);
}

if (failedUnsupported.length > 0) {
  console.error("\nFAIL: unsupported region checks failed:", failedUnsupported.map((r) => r.region).join(", "));
  process.exit(1);
}

const uiRegion =
  mode === "live"
    ? "KE"
    : (enabledPaystackRegionsList.find((region) => region.code === "ZA")?.code ??
      enabledPaystackRegionsList[0]?.code ??
      "KE");
console.log(`\n3. UI onboarding smoke (${uiRegion})`);
const uiUser = regionUsername("region_ui", uiRegion);
await apiSignUp({
  username: uiUser,
  email: `${uiUser}@tribetip.africa`,
  password,
  country_code: uiRegion,
});
if (mode === "live") {
  await waitForPaystackCustomer(uiUser);
}
await clearPaystackSubaccount(uiUser);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.setDefaultTimeout(mode === "live" ? 120_000 : 30_000);

try {
  await page.goto(`${WEB_BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  await page.fill("#login", uiUser);
  await page.fill("#password", password);
  await page.getByRole("main").getByRole("button", { name: /^log in$/i }).click();
  await page.waitForURL("**/dashboard", { timeout: 30000 });
  await page.getByRole("dialog").getByRole("heading", { name: /set up payouts/i }).waitFor();

  const dashboardPage = await page.reload({ waitUntil: "domcontentloaded" });
  assertNoStore(dashboardPage.headers(), "/dashboard");
  await page.getByText("Checking Paystack setup…").waitFor({ state: "hidden", timeout: 60000 });

  if (mode === "live") {
    await completeMpesaOnboardingUI(page);
  } else if (uiRegion === "KE") {
    await completeStubOnboardingUI(page, { countryCode: "KE" });
  } else {
    const uiPaystackRegion = enabledPaystackRegionsList.find((region) => region.code === uiRegion);
    await page.getByText(new RegExp(`Payout market:.*${uiPaystackRegion?.code === "ZA" ? "South Africa" : uiPaystackRegion?.code ?? uiRegion}`)).waitFor();
    await page.locator("#account_number").waitFor();
    await page.fill("#account_number", "0123456789");
    await page.getByRole("button", { name: /link payout account/i }).click();
    await page.getByRole("dialog").waitFor({ state: "hidden", timeout: 15_000 });
  }
} catch (error) {
  console.error("FAIL UI:", error.message);
  process.exit(1);
} finally {
  await browser.close();
}

console.log("\nPASS: all region account flows verified");
