import { chromium } from "playwright";
import {
  WEB_BASE,
  apiRequest,
  apiSignIn,
  assertDashboardShowsUsername,
  assertNoStore,
  assertPublicShort,
  completeOnboardingAfterSignup,
  paystackClientMode,
  setupTippableCreator,
  signInPageSession,
  supportedRegionsForLiveTests,
  waitForDashboardOnboardingClear,
  waitForServices,
} from "./live-helpers.mjs";

const results = [];

function record(name, fn) {
  return fn()
    .then(() => {
      results.push({ case: name, status: "ok" });
      console.log(`   ✓ ${name}`);
    })
    .catch((error) => {
      results.push({ case: name, status: "failed", error: error.message });
      console.error(`   ✗ ${name}: ${error.message}`);
    });
}

function bearer(token) {
  return { Authorization: `Bearer ${token}` };
}

// Public profile + widget config responses are edge-cached by Thruster
// (Cache-Control: public, max-age=60). A rotated token can therefore still
// serve a stale 200 for up to ~60s. Append a unique query param so the cache
// key differs and we observe the backend's true (post-rotation) state.
function bust(path) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}_cb=${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

await waitForServices();
const mode = await paystackClientMode();
const region = (await supportedRegionsForLiveTests())[0];

if (!region) {
  console.error("FAIL: no Paystack-supported region enabled for share/widget test");
  process.exit(1);
}

console.log(`Share/widget E2E (Paystack ${mode}, region ${region.code})\n`);

console.log("0. Provision a tippable creator (signup → payout → publish)");
const { username, password } = await setupTippableCreator(region, { prefix: "share_widget" });
const { token } = await apiSignIn({ login: username, password });
console.log(`   ✓ creator @${username} ready`);

let shareToken = null;
let widgetToken = null;

console.log("\n1. Creator share link + QR target");
await record("share_link returns an opaque token + url", async () => {
  const { response, data } = await apiRequest("GET", "/me/share_link", { headers: bearer(token) });
  if (response.status !== 200) {
    throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
  }
  assertNoStore(response.headers, "/me/share_link");

  const link = data.share_link;
  if (!link?.token) throw new Error(`missing share_link.token: ${JSON.stringify(data)}`);
  if (!link.path?.startsWith("/t/")) throw new Error(`expected path /t/…, got ${link.path}`);
  if (link.shareable !== true) throw new Error(`expected shareable=true, got ${link.shareable}`);
  if (!link.url?.includes(`/t/${link.token}`)) {
    throw new Error(`share url should embed the token, got ${link.url}`);
  }
  if (link.url.includes(username)) {
    throw new Error(`opaque share url must not leak the username: ${link.url}`);
  }
  shareToken = link.token;
});

await record("public profile resolves by share token", async () => {
  const { response, data } = await apiRequest("GET", `/share/${encodeURIComponent(shareToken)}`);
  if (response.status !== 200) {
    throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
  }
  assertPublicShort(response.headers, "/share/:token");
  if (!data.profile?.display_name) {
    throw new Error(`expected profile in payload: ${JSON.stringify(data)}`);
  }
});

console.log("\n2. Supporter opens /t/[token] and reaches the tip UI");
const browser = await chromium.launch({ headless: true });
const supporter = await browser.newContext();
const supporterPage = await supporter.newPage();
supporterPage.setDefaultTimeout(mode === "live" ? 60_000 : 30_000);

try {
  await record("/t/[token] renders the tip form", async () => {
    const response = await supporterPage.goto(`${WEB_BASE}/t/${shareToken}`, {
      waitUntil: "domcontentloaded",
    });
    if (!response?.ok()) {
      throw new Error(`/t/${shareToken} returned ${response?.status()}`);
    }
    await supporterPage
      .getByRole("button", { name: /^Review & send/i })
      .waitFor({ state: "visible", timeout: 30_000 });
  });

  console.log("\n3. Rotating the share token revokes the old link");
  await record("rotate share link issues a fresh token", async () => {
    const { response, data } = await apiRequest("POST", "/me/share_link/rotate", {
      headers: bearer(token),
    });
    if (response.status !== 200) {
      throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    const rotated = data.share_link?.token;
    if (!rotated || rotated === shareToken) {
      throw new Error(`expected a new token, got ${rotated} (was ${shareToken})`);
    }

    const stale = await apiRequest("GET", bust(`/share/${encodeURIComponent(shareToken)}`));
    if (stale.response.status !== 404) {
      throw new Error(`old share token should 404, got ${stale.response.status}`);
    }

    const fresh = await apiRequest("GET", bust(`/share/${encodeURIComponent(rotated)}`));
    if (fresh.response.status !== 200) {
      throw new Error(`new share token should resolve, got ${fresh.response.status}`);
    }
    shareToken = rotated;
  });

  console.log("\n4. Widget embed lifecycle");
  await record("widget starts disabled with no token", async () => {
    const { response, data } = await apiRequest("GET", "/me/widget_embed", {
      headers: bearer(token),
    });
    if (response.status !== 200) {
      throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    assertNoStore(response.headers, "/me/widget_embed");
    const embed = data.widget_embed;
    if (embed?.enabled !== false) throw new Error(`expected enabled=false, got ${embed?.enabled}`);
    if (embed?.token) throw new Error(`expected no token, got ${embed.token}`);
    if (embed?.embed_snippet) throw new Error(`expected no snippet, got ${embed.embed_snippet}`);
  });

  await record("enabling the widget returns a token + embed snippet", async () => {
    const { response, data } = await apiRequest("PATCH", "/me/widget_embed", {
      headers: bearer(token),
      body: {
        widget_embed: {
          widget_enabled: true,
          widget_cta_text: "Buy me a soda",
          widget_position: "bottom-left",
        },
      },
    });
    if (response.status !== 200) {
      throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    const embed = data.widget_embed;
    if (embed?.enabled !== true) throw new Error(`expected enabled=true, got ${embed?.enabled}`);
    if (!embed?.token) throw new Error(`expected widget token: ${JSON.stringify(embed)}`);
    if (!embed.embed_snippet?.includes("widget.js?token=")) {
      throw new Error(`embed snippet missing widget.js?token=: ${embed.embed_snippet}`);
    }
    if (!embed.embed_snippet.includes(`data-token="${embed.token}"`)) {
      throw new Error(`embed snippet missing data-token fallback: ${embed.embed_snippet}`);
    }
    if (embed.cta_text !== "Buy me a soda") {
      throw new Error(`expected cta echoed, got ${embed.cta_text}`);
    }
    widgetToken = embed.token;
  });

  await record("widget renders when injected dynamically (tag-manager style)", async () => {
    const page = await browser.newPage();
    page.setDefaultTimeout(mode === "live" ? 60_000 : 30_000);
    try {
      await page.goto(`${WEB_BASE}/`, { waitUntil: "domcontentloaded" });

      // Inject the way Google Tag Manager / builder code blocks do: create the
      // element and append it, which leaves document.currentScript === null.
      await page.evaluate((src) => {
        const node = document.createElement("script");
        node.src = src;
        node.async = true;
        document.body.appendChild(node);
      }, `${WEB_BASE}/widget.js?token=${widgetToken}`);

      const host = page.locator("[data-tribetip-widget-host]");
      await host.waitFor({ state: "attached", timeout: 30_000 });

      const shadowText = await host.evaluate((el) => el.shadowRoot?.textContent ?? "");
      if (!shadowText.toLowerCase().includes("soda")) {
        throw new Error(`widget shadow content missing CTA, got: ${shadowText.slice(0, 160)}`);
      }
    } finally {
      await page.close();
    }
  });

  await record("public /widget/config returns a valid config", async () => {
    const { response, data } = await apiRequest(
      "GET",
      `/widget/config?token=${encodeURIComponent(widgetToken)}`,
    );
    if (response.status !== 200) {
      throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    assertPublicShort(response.headers, "/widget/config");
    const config = data.config;
    if (!config) throw new Error(`expected config payload: ${JSON.stringify(data)}`);
    if (config.username !== username) {
      throw new Error(`expected username ${username}, got ${config.username}`);
    }
    if (!config.destination_url) throw new Error("config missing destination_url");
    if (config.position !== "bottom-left") {
      throw new Error(`expected position bottom-left, got ${config.position}`);
    }
    if (!config.cta_text) throw new Error("config missing cta_text");
    if (!Array.isArray(config.tip_presets) || config.tip_presets.length === 0) {
      throw new Error(`expected tip_presets array, got ${JSON.stringify(config.tip_presets)}`);
    }
  });

  await record("rotating the widget token revokes the old config", async () => {
    const { response, data } = await apiRequest("POST", "/me/widget_embed/rotate", {
      headers: bearer(token),
    });
    if (response.status !== 200) {
      throw new Error(`expected 200, got ${response.status}: ${JSON.stringify(data)}`);
    }
    const rotated = data.widget_embed?.token;
    if (!rotated || rotated === widgetToken) {
      throw new Error(`expected a new widget token, got ${rotated} (was ${widgetToken})`);
    }

    const stale = await apiRequest("GET", bust(`/widget/config?token=${encodeURIComponent(widgetToken)}`));
    if (stale.response.status !== 404) {
      throw new Error(`old widget token should 404, got ${stale.response.status}`);
    }

    const fresh = await apiRequest("GET", bust(`/widget/config?token=${encodeURIComponent(rotated)}`));
    if (fresh.response.status !== 200) {
      throw new Error(`new widget token should resolve, got ${fresh.response.status}`);
    }
    widgetToken = rotated;
  });

  console.log("\n5. Creator dashboard surfaces the QR + widget snippet");
  const creatorPage = await browser.newPage();
  creatorPage.setDefaultTimeout(mode === "live" ? 60_000 : 30_000);

  await record("dashboard widget page shows the embed snippet", async () => {
    await signInPageSession(creatorPage, { login: username, password });
    await completeOnboardingAfterSignup(creatorPage, { mode, countryCode: region.code });
    await waitForDashboardOnboardingClear(creatorPage, {
      mode,
      countryCode: region.code,
      username,
    });
    await assertDashboardShowsUsername(creatorPage, username);

    await creatorPage.goto(`${WEB_BASE}/dashboard/widget`, { waitUntil: "domcontentloaded" });
    await creatorPage
      .getByRole("heading", { name: /embed snippet/i })
      .waitFor({ state: "visible", timeout: 30_000 });
    await creatorPage.waitForFunction(
      () =>
        [...document.querySelectorAll("textarea")].some((node) =>
          (node.value ?? "").includes("widget.js?token="),
        ),
      { timeout: 30_000 },
    );
  });

  await record("dashboard public page surfaces the QR tip code", async () => {
    await creatorPage.goto(`${WEB_BASE}/dashboard/public-page`, { waitUntil: "domcontentloaded" });
    await creatorPage
      .getByRole("heading", { name: /qr tip code/i })
      .waitFor({ state: "visible", timeout: 30_000 });
  });
} finally {
  await browser.close();
}

console.log("\n6. Share/widget summary");
console.log("Case | Status | Notes");
for (const result of results) {
  console.log(
    [result.case.padEnd(46), result.status.padEnd(6), result.error ?? "-"].join(" | "),
  );
}

const failed = results.filter((result) => result.status !== "ok");
if (failed.length > 0) {
  console.error(
    `\nFAIL: share/widget E2E had failures: ${failed.map((r) => r.case).join(", ")}`,
  );
  process.exit(1);
}

console.log("\nPASS: share link, QR target, and widget embed verified");
