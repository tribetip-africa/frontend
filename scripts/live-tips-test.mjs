import {
  PAYSTACK_REGIONS,
  assertStructuredError,
  auditPaystackOnboarding,
  apiSignUp,
  clearPaystackOnboarding,
  enablePublicProfile,
  fetchLaunchRegions,
  fetchLatestTip,
  fetchPaystackAccounts,
  postTipCheckout,
  regionUsername,
  setupTippableCreator,
  paystackClientMode,
  supportedRegionsForLiveTests,
  waitForServices,
} from "./live-helpers.mjs";

const results = [];

await waitForServices();
const mode = await paystackClientMode();
const tipRegions = await supportedRegionsForLiveTests();
const blockedRegion = tipRegions[0] ?? { code: "KE", currency: "KES" };

console.log(`Paystack mode: ${mode} (testing tips for: ${tipRegions.map((r) => r.code).join(", ")})`);

console.log("1. Reject tips for creators without Paystack onboarding");
try {
  const blockedUser = regionUsername("tips_blocked", blockedRegion.code);
  await apiSignUp({
    username: blockedUser,
    email: `${blockedUser}@tribetip.africa`,
    country_code: blockedRegion.code,
  });
  await enablePublicProfile(blockedUser);
  await clearPaystackOnboarding(blockedUser);

  const blocked = await postTipCheckout({
    username: blockedUser,
    currency: blockedRegion.currency,
    supporterEmail: `blocked_${Date.now()}@tribetip.africa`,
  });

  if (blocked.response.status !== 404) {
    throw new Error(`Expected blocked tip 404, got ${blocked.response.status}`);
  }
  assertStructuredError(blocked.data, { code: "not_found" });
  results.push({ case: "blocked_without_onboarding", region: blockedRegion.code, status: "ok" });
  console.log("   ✓ tips blocked without Paystack onboarding");
} catch (error) {
  results.push({
    case: "blocked_without_onboarding",
    region: blockedRegion.code,
    status: "failed",
    error: error.message,
  });
  console.error(`   ✗ blocked without onboarding: ${error.message}`);
}

console.log("\n2. Multi-region tips checkout matrix");
for (const region of tipRegions) {
  const record = { case: "checkout", region: region.code, status: "failed" };

  try {
    const { username } = await setupTippableCreator(region, { prefix: "tips_checkout" });
    const supporterEmail = `fan_${region.code.toLowerCase()}_${Date.now()}@tribetip.africa`;

    const checkout = await postTipCheckout({
      username,
      currency: region.currency,
      amountCents: 50_000,
      supporterEmail,
    });

    if (checkout.response.status !== 201) {
      throw new Error(`tip checkout ${checkout.response.status}: ${JSON.stringify(checkout.data)}`);
    }
    if (!checkout.data.tip?.authorization_url) {
      throw new Error("missing authorization_url");
    }
    if (checkout.data.tip.currency !== region.currency) {
      throw new Error(`expected currency ${region.currency}, got ${checkout.data.tip.currency}`);
    }

    const storedTip = await fetchLatestTip(username);
    if (!storedTip) {
      throw new Error("tip not persisted");
    }
    if (storedTip.currency !== region.currency) {
      throw new Error(`stored tip currency ${storedTip.currency} != ${region.currency}`);
    }
    if (storedTip.status !== "pending") {
      throw new Error(`expected pending tip, got ${storedTip.status}`);
    }

    if (mode === "live") {
      const accounts = await fetchPaystackAccounts(username);
      if (!accounts.subaccountCode) {
        throw new Error("expected linked subaccount after checkout");
      }
      record.steps = { checkout: "ok", persisted: "ok", audit: "linked" };
    } else {
      const audit = await auditPaystackOnboarding(username);
      if (!audit.healthy) {
        throw new Error(`audit unhealthy after checkout: ${JSON.stringify(audit.checks)}`);
      }
      record.steps = { checkout: "ok", persisted: "ok", audit: "ok" };
    }
    record.status = "ok";
    console.log(`   ✓ ${region.code} tip checkout passed (${region.currency})`);
  } catch (error) {
    record.error = error.message;
    console.error(`   ✗ ${region.code} tip checkout failed: ${error.message}`);
  }

  results.push(record);
}

console.log("\n3. Unsupported region tips remain blocked");
const launchRegions = await fetchLaunchRegions();
const enabledCodes = new Set(
  launchRegions.regions.filter((region) => region.enabled).map((region) => region.code),
);
const unsupportedRegion = PAYSTACK_REGIONS.find(
  (region) => !region.subaccountSupported && enabledCodes.has(region.code),
);

if (unsupportedRegion) {
  const record = { case: "unsupported_region", region: unsupportedRegion.code, status: "failed" };

  try {
    const username = regionUsername("tips_ci", unsupportedRegion.code);
    await apiSignUp({
      username,
      email: `${username}@tribetip.africa`,
      country_code: unsupportedRegion.code,
    });
    await enablePublicProfile(username);

    const blocked = await postTipCheckout({
      username,
      currency: unsupportedRegion.currency,
      supporterEmail: `ci_fan_${Date.now()}@tribetip.africa`,
    });

    if (blocked.response.status !== 404) {
      throw new Error(`expected unsupported region tip 404, got ${blocked.response.status}`);
    }
    assertStructuredError(blocked.data, { code: "not_found" });

    const audit = await auditPaystackOnboarding(username);
    if (!audit.healthy) {
      throw new Error(`expected healthy unsupported audit, got ${JSON.stringify(audit.checks)}`);
    }
    if (audit.onboarding_complete) {
      throw new Error("unsupported region should not complete onboarding");
    }

    record.status = "ok";
    console.log(`   ✓ ${unsupportedRegion.code} tips blocked as expected`);
  } catch (error) {
    record.error = error.message;
    console.error(`   ✗ ${unsupportedRegion.code} unsupported region check failed: ${error.message}`);
  }

  results.push(record);
} else {
  const disabledUnsupported = PAYSTACK_REGIONS.find((region) => !region.subaccountSupported);
  if (disabledUnsupported) {
    const record = {
      case: "unsupported_region",
      region: disabledUnsupported.code,
      status: "failed",
    };

    try {
      const username = regionUsername("tips_ci", disabledUnsupported.code);
      await apiSignUp({
        username,
        email: `${username}@tribetip.africa`,
        country_code: disabledUnsupported.code,
      });
      throw new Error(`expected signup blocked for ${disabledUnsupported.code}`);
    } catch (error) {
      if (!error.message.includes("(422)")) {
        record.error = error.message;
        console.error(
          `   ✗ ${disabledUnsupported.code} unsupported region check failed: ${error.message}`,
        );
      } else {
        record.status = "ok";
        console.log(
          `   ✓ ${disabledUnsupported.code} unavailable at signup (tips implicitly blocked)`,
        );
      }
    }

    results.push(record);
  } else {
    console.log("   — no unsupported regions configured");
  }
}

console.log("\n4. Tips matrix summary");
console.log("Case | Region | Status | Notes");
for (const result of results) {
  const notes =
    result.error ??
    (result.steps ? Object.entries(result.steps).map(([key, value]) => `${key}=${value}`).join(", ") : "-");
  console.log(
    [
      result.case.padEnd(24),
      (result.region ?? "-").padEnd(6),
      result.status.padEnd(6),
      notes,
    ].join(" | "),
  );
}

const failed = results.filter((result) => result.status !== "ok");
if (failed.length > 0) {
  console.error("\nFAIL: tips matrix had failures:", failed.map((result) => `${result.case}:${result.region}`).join(", "));
  process.exit(1);
}

console.log("\nPASS: multi-region tips matrix verified");
